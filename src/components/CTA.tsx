import Image from 'next/image';
import styles from './CTA.module.css';

export default function CTA() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.box}>
          <div className={styles.content}>
            <h2 className={styles.title}>
              Docusign IAM is the agreement platform your business needs
            </h2>
            <div className={styles.buttons}>
              <button className={styles.primaryButton}>Get started</button>
              <button className={styles.secondaryButton}>Explore Docusign IAM</button>
            </div>
          </div>
          <div className={styles.imageWrapper}>
            <div className={styles.imageOutline}>
              <Image 
                src="/images/women_office.png" 
                alt="Women in office" 
                fill 
                className={styles.image}
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
