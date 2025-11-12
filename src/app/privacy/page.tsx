export default function PrivacyPage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="prose prose-lg max-w-none text-foreground prose-h1:font-headline prose-h1:text-4xl prose-h2:font-headline prose-h2:text-2xl prose-a:text-primary hover:prose-a:text-primary/80">
          <h1>Privacy Policy</h1>
          <p className="lead">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <p>
            ServiceWalla ("us", "we", or "our") operates the
            https://servicewalla.com website (the "Service"). This page
            informs you of our policies regarding the collection, use, and
            disclosure of personal data when you use our Service and the choices
            you have associated with that data.
          </p>

          <h2>1. Information Collection and Use</h2>
          <p>
            We collect several different types of information for various
            purposes to provide and improve our Service to you. This includes, but
            is not limited to, personal identification information (name, email
            address, phone number) and usage data.
          </p>

          <h2>2. Use of Data</h2>
          <p>
            ServiceWalla uses the collected data for various purposes:
          </p>
          <ul>
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>
              To allow you to participate in interactive features of our Service
              when you choose to do so
            </li>
            <li>To provide customer support</li>
            <li>
              To gather analysis or valuable information so that we can improve
              our Service
            </li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
          
          <h2>3. Data Security</h2>
          <p>
            The security of your data is important to us but remember that no
            method of transmission over the Internet or method of electronic
            storage is 100% secure. While we strive to use commercially
            acceptable means to protect your Personal Data, we cannot guarantee
            its absolute security.
          </p>
          
          <h2>4. Your Data Protection Rights</h2>
            <p>You have certain data protection rights. ServiceWalla aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data. If you wish to be informed what Personal Data we hold about you and if you want it to be removed from our systems, please contact us.</p>
          
          <h2>5. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page.
            You are advised to review this Privacy Policy periodically for any
            changes.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please{" "}
            <a href="/contact">contact us</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
