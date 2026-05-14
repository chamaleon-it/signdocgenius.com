import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}></span>
            <span className={styles.logoText}>Docusign</span>
          </Link>
          <nav className={styles.nav}>
            <Link href="#" className={styles.navLink}>Products</Link>
            <Link href="#" className={styles.navLink}>Use Cases</Link>
            <Link href="#" className={styles.navLink}>Developers</Link>
            <Link href="#" className={styles.navLink}>Support</Link>
          </nav>
        </div>
        <div className={styles.right}>
          <Link href="#" className={styles.navLink}>Log In</Link>
          <Link href="#" className={styles.ctaButton}>Free trial</Link>
        </div>
      </div>
    </header>
  );
}
