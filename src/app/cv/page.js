import CvPageClient from "./page-client";
import styles from "./cv.module.css";

export const metadata = {
  title: "Adnan Sami — CV | adnanzeros",
  description:
    "Curriculum vitae of Adnan Sami (adnanzeros), junior full-stack developer, web designer and digital creator from Faridpur, Bangladesh.",
};

export default function CvPage() {
  return (
    <div className={styles.page}>
      <CvPageClient />
    </div>
  );
}
