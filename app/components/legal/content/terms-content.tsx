import React from "react";
import {
  BusinessEmailLink,
  DBAName,
  LegalCompanyName,
  BusinessPhone,
  BusinessAddressBlock,
} from "../components/LegalTokens";

type TermsContentProps = {
  lastUpdated?: string;
  siteUrl?: string;
  businessLocation?: string; // city/state/country for venue clause
};

export default function TermsContent({
  lastUpdated = process.env.NEXT_PUBLIC_TERMS_LAST_UPDATED ?? "March 5, 2026",
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://maximstrong.com",
  businessLocation = process.env.NEXT_PUBLIC_BUSINESS_LOCATION ?? "San Antonio, Texas, United States of America",
}: TermsContentProps) {
  return (
    <>
      <h2 id="terms-of-use">Website Terms of Use</h2>
      <p>
        <strong>Last Updated:</strong> {lastUpdated}
      </p>

      <p>
        These Website Terms of Use (“Terms”) govern your access to and use of{" "}
        <a href={siteUrl} target="_blank" rel="noopener noreferrer">
          {siteUrl}
        </a>{" "}
        (the “Site”). The Site is provided by <strong><LegalCompanyName /></strong>, doing business as{" "}
        <strong><DBAName /></strong> (“we,” “us,” “our”).
      </p>

      <p>
        This Site is intended to provide general information about our gym, training programs, schedules, and services.
        <strong> No purchases or transactions are processed directly on this Site.</strong>
      </p>

      <hr />

      <h2 id="acceptance">Acceptance of Terms</h2>
      <p>
        By accessing or using the Site, you agree to be bound by these Terms. If you do not agree, please do not use the
        Site.
      </p>

      <hr />

      <h2 id="informational-use">Informational and Promotional Use</h2>
      <p>
        Content on this Site is provided for informational and promotional purposes only. We may update, change, or
        remove content at any time without notice, including class schedules, pricing, promotions, and program details.
      </p>

      <hr />

      <h2 id="fitness-medical-disclaimer">Fitness and Medical Disclaimer</h2>
      <p>
        The Site may include fitness, training, or wellness information. This information is not medical advice and is
        not a substitute for professional medical guidance, diagnosis, or treatment. Always consult a qualified health
        professional before starting any new exercise program, especially if you have a medical condition or injury.
      </p>

      <hr />

      <h2 id="assumption-of-risk">Assumption of Risk</h2>
      <p>
        Physical exercise carries inherent risks. By participating in any fitness activities referenced on this Site or
        offered by our gym, you acknowledge and accept those risks. Participation decisions are your responsibility.
      </p>
      <p>
        Any gym participation policies, waivers, releases, and membership terms are handled separately and may be
        presented in-person or through our official membership onboarding process.
      </p>

      <hr />

      <h2 id="user-conduct">User Conduct</h2>
      <p>
        You agree not to misuse the Site, attempt to gain unauthorized access, interfere with the Site’s operation, or
        use the Site for unlawful purposes.
      </p>

      <hr />

      <h2 id="intellectual-property">Intellectual Property</h2>
      <p>
        Unless otherwise stated, the Site and its content (including text, images, graphics, logos, and design elements)
        are owned by <strong><LegalCompanyName /></strong> and are protected by intellectual property laws. You may not
        copy, reproduce, or distribute Site content without our written permission.
      </p>

      <hr />

      <h2 id="third-party-links">Third-Party Links</h2>
      <p>
        The Site may include links to third-party websites or services (for example, social platforms, scheduling tools,
        or map providers). We do not control these third parties and are not responsible for their content, policies, or
        practices. Your use of third-party sites is at your own risk and subject to their terms.
      </p>

      <hr />

      <h2 id="privacy">Privacy and Cookies</h2>
      <p>
        Our collection and use of personal information is described in our <a href="/privacy">Privacy Policy</a>. We may
        use cookies and similar technologies; you can review details in our cookie section (where available) and manage
        your cookie preferences through the Site’s cookie settings.
      </p>

      <hr />

      <h2 id="disclaimer-of-warranties">Disclaimer of Warranties</h2>
      <p>
        The Site is provided on an “as is” and “as available” basis. We make no warranties, express or implied, about the
        accuracy, completeness, or reliability of the Site or its content.
      </p>

      <hr />

      <h2 id="limitation-of-liability">Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, <strong><LegalCompanyName /></strong> will not be liable for any indirect,
        incidental, special, consequential, or punitive damages arising from or related to your use of (or inability to
        use) the Site, including reliance on Site content.
      </p>

      <hr />

      <h2 id="changes-to-terms">Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. The “Last Updated” date reflects the most recent revision. Your
        continued use of the Site after changes are posted constitutes acceptance of the updated Terms.
      </p>

      <hr />

      <h2 id="governing-law">Governing Law</h2>
      <p>
        These Terms are governed by the laws applicable in <strong>{businessLocation}</strong>, without regard to
        conflict-of-law principles.
      </p>

      <hr />

      <h2 id="contact">Contact</h2>
      <p>
        If you have questions about these Terms, contact us by email at{" "}
        <BusinessEmailLink className="underline underline-offset-4" />, by phone at{" "}
        <BusinessPhone />, or by mail:
      </p>
      <BusinessAddressBlock />
    </>
  );
}