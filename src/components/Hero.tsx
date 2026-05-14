import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.title}>Everything you need to agree</h1>
        <p className={styles.subtitle}>
          Send, sign and manage in one agreement platform.
        </p>
        <p className={styles.subtext}>
          <input type="checkbox" id="consent" className={styles.checkbox} />
          <label htmlFor="consent" className={styles.consentLabel}>
            I consent to receive emails about Docusign's products and services.
            <br />
            You can read our Privacy Policy, or withdraw your consent at any time.
          </label>
        </p>
        <form className={styles.form}>
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>Get started</button>
        </form>
        <p className={styles.loginText}>
          Already have an account? <a href="#" className={styles.loginLink}>Log in</a>
        </p>
      </div>
    </section>
  );
}
