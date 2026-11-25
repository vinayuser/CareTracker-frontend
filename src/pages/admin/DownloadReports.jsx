import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import DownloadReportsPage from '../reports/DownloadReportsPage';

export default function AdminDownloadReports() {
  const [agencies, setAgencies] = useState([]);

  useEffect(() => {
    let active = true;
    axiosInstance
      .get(API_ROUTES.ADMIN.AGENCY.OPTIONS)
      .then((res) => {
        if (!active) return;
        const rows = res.data?.data?.list || res.data?.data?.options || res.data?.data || [];
        setAgencies(
          (Array.isArray(rows) ? rows : []).map((row) => ({
            id: String(row.id || row._id || row.value || ''),
            name: row.name || row.label || row.agencyName || 'Agency',
          })).filter((row) => row.id),
        );
      })
      .catch(() => {
        if (active) setAgencies([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return <DownloadReportsPage scope="admin" agencies={agencies} />;
}
