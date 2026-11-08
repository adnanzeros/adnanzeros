import './admin.css';
import './matrix.css';

export const metadata = {
  title: 'Admin | adnanzeros',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }) {
  return <div className="adm-root">{children}</div>;
}
