import axiosInstance from '../api/axiosInstance';
import API_ROUTES from '../api/apiRoutes';
import { toApiUploadUrl } from './appUrl';

export function isSignatureImage(value) {
  if (!value || typeof value !== 'string') return false;
  return value.startsWith('data:image')
    || value.startsWith('/uploads/')
    || value.startsWith('/api/uploads/')
    || /^https?:\/\//i.test(value);
}

export function signatureImageSrc(value) {
  if (!isSignatureImage(value)) return '';
  if (value.startsWith('data:image')) return value;
  return toApiUploadUrl(value);
}

export async function uploadAssessmentSignature(dataUrl) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const type = blob.type || 'image/png';
  const ext = type.includes('jpeg') || type.includes('jpg') ? 'jpg' : 'png';
  const file = new File([blob], `signature.${ext}`, { type });
  const body = new FormData();
  body.append('signature', file);
  const res = await axiosInstance.post(API_ROUTES.AGENCY.ASSESSMENTS.SIGNATURE, body);
  const url = res.data?.data?.url;
  if (!url) throw new Error('Signature upload failed');
  return url;
}

/** Replace embedded signature images with uploaded file URLs before the assessment is saved. */
export async function externalizeDataImages(value) {
  const cache = new Map();

  async function walk(node) {
    if (typeof node === 'string') {
      if (!node.startsWith('data:image/')) return node;
      if (!cache.has(node)) cache.set(node, uploadAssessmentSignature(node));
      return cache.get(node);
    }
    if (Array.isArray(node)) return Promise.all(node.map((item) => walk(item)));
    if (node && typeof node === 'object') {
      const entries = await Promise.all(
        Object.entries(node).map(async ([key, child]) => [key, await walk(child)]),
      );
      return Object.fromEntries(entries);
    }
    return node;
  }

  return walk(value);
}
