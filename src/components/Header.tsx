import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo}>
            <img 
              src="/images/logo.png" 
              alt="SignDocGenius Logo" 
              style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
            />
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
