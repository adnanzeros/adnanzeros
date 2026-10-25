import CvPageClient from './page-client';
import styles from './cv.module.css';

const TITLE = 'Adnan Sami — CV | adnanzeros';
const DESCRIPTION =
  'Curriculum vitae of Adnan Sami (adnanzeros), junior full-stack developer, web designer and digital creator from Faridpur, Bangladesh.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'profile',
  },
};

export default function CvPage() {
  return (
    <div className={styles.page}>
      <CvPageClient />
    </div>
  );
}
