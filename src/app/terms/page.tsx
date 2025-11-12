export default function TermsPage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="prose prose-lg max-w-none text-foreground prose-h1:font-headline prose-h1:text-4xl prose-h2:font-headline prose-h2:text-2xl prose-a:text-primary hover:prose-a:text-primary/80">
          <h1>Terms of Service</h1>
          <p className="lead">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p>
            Please read these Terms of Service ("Terms", "Terms of Service")
            carefully before using the https://servicewalla.com website (the
            "Service") operated by ServiceWalla ("us", "we", or "our").
          </p>
          <p>
            Your access to and use of the Service is conditioned on your
            acceptance of and compliance with these Terms. These Terms apply to
            all visitors, users, and others who access or use the Service.
          </p>

          <h2>1. Accounts</h2>
          <p>
            When you create an account with us, you must provide us with
            information that is accurate, complete, and current at all times.
            Failure to do so constitutes a breach of the Terms, which may result
            in immediate termination of your account on our Service. You are
            responsible for safeguarding the password that you use to access the
            Service and for any activities or actions under your password.
          </p>

          <h2>2. Bookings, Cancellations, and Payments</h2>
          <p>
            By booking a service, you agree to pay the quoted price. Payments are
            processed through our secure third-party payment processor. Our
            cancellation policy allows for free cancellations up to 24 hours
            before the scheduled service. Cancellations within 24 hours may
            incur a fee.
          </p>

          <h2>3. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality
            are and will remain the exclusive property of ServiceWalla and its
            licensors.
          </p>

          <h2>4. Limitation Of Liability</h2>
          <p>
            In no event shall ServiceWalla, nor its directors, employees,
            partners, agents, suppliers, or affiliates, be liable for any
            indirect, incidental, special, consequential or punitive damages,
            including without limitation, loss of profits, data, use, goodwill,
            or other intangible losses, resulting from your access to or use of
            or inability to access or use the Service.
          </p>

          <h2>5. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the
            laws of our jurisdiction, without regard to its conflict of law
            provisions.
          </p>

          <h2>Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. We will try to provide at least 30 days'
            notice prior to any new terms taking effect.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about these Terms, please{" "}
            <a href="/contact">contact us</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
