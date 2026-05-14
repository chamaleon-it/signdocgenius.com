import styles from './Features.module.css';

export default function Features() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          <span className={styles.purpleText}>Go paperless</span> with Docusign
        </h2>
        
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.icon}>⚡</div>
            <h3 className={styles.cardTitle}>eSignature</h3>
            <p className={styles.cardText}>
              Get agreements signed anywhere, on any device. Docusign is the fast, reliable way to sign documents.
            </p>
          </div>
          
          <div className={styles.card}>
            <div className={styles.icon}>📄</div>
            <h3 className={styles.cardTitle}>Document delivery</h3>
            <p className={styles.cardText}>
              Send documents to anyone, instantly. Track status and get notifications when they're signed.
            </p>
          </div>
          
          <div className={styles.card}>
            <div className={styles.icon}>✅</div>
            <h3 className={styles.cardTitle}>Verify your identity & e-sign</h3>
            <p className={styles.cardText}>
              Confirm identity before signing with a strong verification process that reduces fraud.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
