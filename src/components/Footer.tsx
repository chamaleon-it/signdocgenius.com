import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topContainer}>
        <div className={styles.linksGrid}>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Docusign</h4>
            <a href="#" className={styles.link}>Products</a>
            <a href="#" className={styles.link}>Pricing</a>
          </div>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Use Cases</h4>
            <a href="#" className={styles.link}>Customer Sales</a>
            <a href="#" className={styles.link}>Small Business</a>
          </div>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Support</h4>
            <a href="#" className={styles.link}>Support Center</a>
            <a href="#" className={styles.link}>Docusign Community</a>
            <a href="#" className={styles.link}>Trust Center</a>
            <a href="#" className={styles.link}>Security</a>
          </div>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>About Us</h4>
            <a href="#" className={styles.link}>Leadership</a>
            <a href="#" className={styles.link}>Investors</a>
            <a href="#" className={styles.link}>Careers</a>
          </div>
        </div>
        <div className={styles.socialAndLang}>
          <select className={styles.langSelect}>
            <option>English</option>
          </select>
          <div className={styles.socialIcons}>
            <span className={styles.icon}>X</span>
            <span className={styles.icon}>In</span>
            <span className={styles.icon}>YT</span>
            <span className={styles.icon}>IG</span>
          </div>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <span className={styles.copyright}>
            © Docusign, Inc. 2024. All rights reserved.
          </span>
          <div className={styles.bottomLinks}>
            <a href="#" className={styles.bottomLink}>Terms of Use</a>
            <a href="#" className={styles.bottomLink}>Privacy Policy</a>
            <a href="#" className={styles.bottomLink}>Cookie Settings</a>
          </div>
          <button className={styles.feedbackButton}>Feedback</button>
        </div>
      </div>
    </footer>
  );
}
