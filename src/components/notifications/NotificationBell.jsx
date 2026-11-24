import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2, X } from 'lucide-react';
import {
  NOTIFICATIONS_PAGE_SIZE,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../redux/slices/notificationsSlice';

const TONE_DOT = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-primary',
};

const formatWhen = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const resolveActionUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return url;
    }
  }
  return url.startsWith('/') ? url : `/${url}`;
};

function useIsMobile(breakpointPx = 640) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${breakpointPx - 1}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [breakpointPx]);

  return isMobile;
}

export default function NotificationBell({ className = '' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const panelId = useId();
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [desktopPos, setDesktopPos] = useState({ top: 0, right: 0 });
  const isMobile = useIsMobile();
  const { items, unreadCount, loading, loadingMore, pagination } = useSelector(
    (state) => state.notifications,
  );

  const hasMore = (pagination?.page || 1) < (pagination?.totalPages || 1);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    const timer = setInterval(() => dispatch(fetchUnreadCount()), 60000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const updateDesktopPosition = useCallback(() => {
    const trigger = rootRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setDesktopPos({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    dispatch(fetchNotifications({ page: 1, limit: NOTIFICATIONS_PAGE_SIZE, append: false }));
    updateDesktopPosition();

    const onPointer = (event) => {
      const target = event.target;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onResize = () => {
      if (!isMobile) updateDesktopPosition();
    };

    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer, { passive: true });
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);

    const prevOverflow = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, dispatch, isMobile, updateDesktopPosition]);

  const loadNextPage = useCallback(() => {
    if (!hasMore || loading || loadingMore) return;
    const nextPage = (pagination?.page || 1) + 1;
    dispatch(fetchNotifications({
      page: nextPage,
      limit: NOTIFICATIONS_PAGE_SIZE,
      append: true,
    }));
  }, [dispatch, hasMore, loading, loadingMore, pagination?.page]);

  const handleListScroll = (event) => {
    const el = event.currentTarget;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining < 80) loadNextPage();
  };

  const handleOpen = () => setOpen((value) => !value);

  const handleItemClick = async (item) => {
    if (!item.read) {
      await dispatch(markNotificationRead(item.id));
    }
    setOpen(false);
    const path = resolveActionUrl(item.actionUrl);
    if (path) navigate(path);
  };

  const handleMarkAll = async () => {
    await dispatch(markAllNotificationsRead());
    dispatch(fetchNotifications({ page: 1, limit: NOTIFICATIONS_PAGE_SIZE, append: false }));
  };

  const badge = unreadCount > 99 ? '99+' : String(unreadCount);

  const panel = open
    ? createPortal(
      <>
        {isMobile ? (
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className={
            isMobile
              ? 'fixed inset-x-0 bottom-0 z-[70] flex max-h-[min(85dvh,36rem)] flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl'
              : 'fixed z-[70] flex max-h-[min(28rem,calc(100dvh-5rem))] w-[min(22rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl'
          }
          style={
            isMobile
              ? { paddingBottom: 'env(safe-area-inset-bottom)' }
              : { top: desktopPos.top, right: desktopPos.right }
          }
        >
          {isMobile ? (
            <div className="flex justify-center pb-1 pt-2.5">
              <span className="h-1 w-10 rounded-full bg-gray-300" />
            </div>
          ) : null}

          <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              <p className="text-xs text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
                >
                  <CheckCheck size={14} />
                  Mark all
                </button>
              )}
              {isMobile ? (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              ) : null}
            </div>
          </div>

          <div
            className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${isMobile ? '' : 'max-h-96'}`}
            onScroll={handleListScroll}
          >
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                Loading...
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">No notifications yet</p>
            ) : (
              <>
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`flex w-full gap-3 border-b border-gray-50 px-4 py-3.5 text-left transition hover:bg-gray-50 active:bg-gray-100 ${item.read ? 'opacity-75' : 'bg-primary/[0.03]'}`}
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TONE_DOT[item.tone] || TONE_DOT.info}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-gray-900 break-words">{item.title}</span>
                      {item.body ? (
                        <span className="mt-0.5 block text-xs text-gray-600 break-words line-clamp-3 sm:line-clamp-2">
                          {item.body}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-[11px] text-gray-400">{formatWhen(item.createdAt)}</span>
                    </span>
                  </button>
                ))}
                {loadingMore ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-3 text-xs text-gray-500">
                    <Loader2 size={14} className="animate-spin" />
                    Loading more…
                  </div>
                ) : null}
                {!loadingMore && hasMore ? (
                  <p className="px-4 py-2 text-center text-[11px] text-gray-400">Scroll for more</p>
                ) : null}
                {!loadingMore && !hasMore && items.length > 0 ? (
                  <p className="px-4 py-2 text-center text-[11px] text-gray-400">End of notifications</p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </>,
      document.body,
    )
    : null;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        title="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? panelId : undefined}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {badge}
          </span>
        )}
      </button>
      {panel}
    </div>
  );
}
