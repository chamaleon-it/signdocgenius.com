import styles from './CustomerLogos.module.css';

export default function CustomerLogos() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.logos}>
          <span className={styles.logo}>United</span>
          <span className={styles.logo}>Airbus</span>
          <span className={styles.logo}>Unilever</span>
          <span className={styles.logo}>Celonis</span>
          <span className={styles.logo}>Santander</span>
          <span className={styles.logo}>TATA</span>
        </div>
      </div>
    </section>
  );
}
