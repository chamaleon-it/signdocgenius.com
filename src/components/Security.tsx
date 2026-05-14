import Image from 'next/image';
import styles from './Security.module.css';

export default function Security() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <Image 
              src="/images/worker.png" 
              alt="Worker with yellow fabric" 
              fill 
              className={styles.image} 
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
        <div className={styles.contentColumn}>
          <h2 className={styles.title}>
            Docusign meets or exceeds stringent global security standards
          </h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <span className={styles.check}>✓</span> ISO 27001
            </li>
            <li className={styles.listItem}>
              <span className={styles.check}>✓</span> PCI Data Security Standard
            </li>
            <li className={styles.listItem}>
              <span className={styles.check}>✓</span> SOC 1 to SOC 2 Type 2
            </li>
            <li className={styles.listItem}>
              <span className={styles.check}>✓</span> CSA STAR
            </li>
            <li className={styles.listItem}>
              <span className={styles.check}>✓</span> APEC PRP
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
