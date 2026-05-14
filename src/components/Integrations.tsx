import Image from 'next/image';
import styles from './Integrations.module.css';

export default function Integrations() {
  return (
    <section className={styles.section}>
      <div className={styles.topSection}>
        <div className={styles.imageWrapper}>
          <Image 
            src="/images/women_tablet.png" 
            alt="Colleagues working" 
            fill 
            className={styles.image}
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className={styles.purpleBox}>
          <h2 className={styles.boxTitle}>It starts with a signature</h2>
          <p className={styles.boxText}>
            Every agreement involves your customer and employee experience. It is the beginning of the relationship, which is usually digital, mobile, and dynamic.
          </p>
          <button className={styles.boxButton}>Get a free account</button>
        </div>
      </div>
      
      <div className={styles.bottomSection}>
        <h2 className={styles.bottomTitle}>Integrations for every workflow</h2>
        <p className={styles.bottomSubtitle}>
          Simply, securely connect your existing systems—with more than 500 prebuilt integrations across apps you already use.
        </p>
        
        <div className={styles.grid}>
          <div className={styles.logoBox}>Google</div>
          <div className={styles.logoBox}>Salesforce</div>
          <div className={styles.logoBox}>Workday</div>
          <div className={styles.logoBox}>Microsoft</div>
          <div className={styles.logoBox}>Slack</div>
          <div className={styles.logoBox}>Apple</div>
          <div className={styles.logoBox}>Zoom</div>
          <div className={styles.logoBox}>Intuit</div>
        </div>
      </div>
    </section>
  );
}
