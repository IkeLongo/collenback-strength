import React from "react";
import {
  BusinessAddressBlock,
  BusinessEmailLink,
  BusinessPhone
} from "../components/LegalTokens";
import CookiePreferencesLink from "../../cookies/components/CookiePreferencesLink";

export default function PrivacyContent() {
  return (
    <>
      <h2 id="privacy-notice">Privacy Notice</h2>
      <p>
        This Privacy Policy explains how we collect, use, and protect information when you visit our website,
        contact us, or use our services. If you do not agree with this policy, please do not use our site.
      </p>

      <hr />

      <h2 id="information-we-collect">Information we collect</h2>

      <h3 id="information-you-provide">Information you provide to us</h3>
      <p>
        <strong>In Short:</strong> <em>We collect personal information you choose to share with us.</em>
      </p>
      <p>
        We collect information you voluntarily provide when you contact us, request information, submit forms,
        or otherwise communicate with us.
      </p>

      <p><strong>Examples may include:</strong></p>
      <ul>
        <li>Name and contact details (such as email address, phone number, or mailing address)</li>
        <li>Message content you submit through forms or email</li>
        <li>Basic business information you choose to share (such as company name)</li>
      </ul>

      <p>
        <strong>Sensitive information.</strong> We do not intentionally collect or process sensitive personal information.
        Please avoid submitting sensitive information through our forms.
      </p>

      <p>
        <strong>Payments.</strong> If you purchase services, payment processing may be handled by third-party processors
        (for example, Stripe). We do not store full payment card details on our servers. You can review Stripe’s
        privacy policy at{" "}
        <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
          https://stripe.com/privacy
        </a>
        .
      </p>

      <h3 id="information-collected-automatically">Information collected automatically</h3>
      <p>
        <strong>In Short:</strong>{" "}
        <em>Some information is collected automatically when you use our website (like device and usage data).</em>
      </p>

      <p>
        When you visit our website, we may automatically collect certain information that does not directly identify you,
        such as your device type, browser, IP address, pages viewed, and approximate location inferred from IP.
        We use this information to maintain security, operate the site, and understand performance.
      </p>

      <p>
        We may use cookies and similar technologies. For details, see our{" "}
        <a href="#cookie-policy">Cookie Policy</a>.
      </p>

      <p>
        If analytics is enabled with your consent, we may use tools like Google Analytics and Microsoft Clarity. You can learn more here:
      </p>
      <ul>
        <li>
          <a href="https://www.google.com/policies/privacy/" target="_blank" rel="noopener noreferrer">
            https://www.google.com/policies/privacy/
          </a>
        </li>
        <li>
          <a
            href="https://marketingplatform.google.com/about/analytics/terms/us/"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://marketingplatform.google.com/about/analytics/terms/us/
          </a>
        </li>
        <li>
          <a
            href="https://www.microsoft.com/en-us/privacy/privacystatement"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.microsoft.com/en-us/privacy/privacystatement
          </a>
        </li>
      </ul>

      <hr />

      <h2 id="how-we-use-information">How we use your information</h2>
      <p>
        <strong>In Short:</strong>{" "}
        <em>We use information to provide services, respond to you, improve our website, and keep things secure.</em>
      </p>

      <p>We may use your information to:</p>
      <ul>
        <li>Respond to inquiries and provide customer support</li>
        <li>Deliver and improve our services and website experience</li>
        <li>Send administrative messages (policy updates, confirmations, service communications)</li>
        <li>Maintain security, prevent fraud, and troubleshoot issues</li>
        <li>Measure site performance (analytics only if you consent)</li>
      </ul>

      <p>
        If you opt in to marketing communications, you can unsubscribe anytime using the link in the message.
      </p>

      <hr />

      <h2 id="sharing-information">When we share information</h2>
      <p>
        <strong>In Short:</strong>{" "}
        <em>We may share information with service providers who help us operate the website and deliver services.</em>
      </p>

      <p>
        We may share your information with vendors, contractors, or service providers who perform services on our behalf
        (for example: website hosting, analytics, forms/email delivery, payment processing). These providers are only
        permitted to use your information to perform services for us and must protect it.
      </p>

      <p>We may also share information if necessary:</p>
      <ul>
        <li><strong>Legal compliance.</strong> To comply with law, regulation, or legal process</li>
        <li><strong>Business transfers.</strong> In connection with a merger, sale, financing, or acquisition</li>
        <li><strong>Protection.</strong> To protect our rights, safety, and property, or the rights of others</li>
      </ul>

      <hr />

      <h2 id="cookies-and-tracking">Cookies and tracking technologies</h2>
      <p>
        <strong>In Short:</strong> <em>We use cookies to operate the site and (with your consent) for analytics/marketing.</em>
      </p>

      <p>
        We use cookies and similar technologies (like pixels) to access or store information. You can manage your cookie
        preferences at any time using our cookie settings.
      </p>

      <hr />

      <h2 id="retention">How long we keep your information</h2>
      <p>
        <strong>In Short:</strong>{" "}
        <em>We keep your information only as long as needed for the purposes described, unless the law requires longer.</em>
      </p>

      <p>
        We retain personal information for as long as necessary to provide services, respond to requests, maintain
        business records, and comply with legal obligations. When we no longer have a legitimate business need, we will
        delete or anonymize it where feasible.
      </p>

      <hr />

      <h2 id="security">How we keep your information safe</h2>
      <p>
        <strong>In Short:</strong>{" "}
        <em>We use reasonable security measures, but no method of transmission or storage is 100% secure.</em>
      </p>

      <p>
        We implement appropriate technical and organizational safeguards designed to protect personal information.
        However, no internet transmission or storage system can be guaranteed to be fully secure, so you use the website
        at your own risk.
      </p>

      <hr />

      <h2 id="minors">Children’s privacy</h2>
      <p>
        <strong>In Short:</strong> <em>We do not knowingly collect information from children under 18.</em>
      </p>
      <p>
        We do not knowingly solicit data from or market to children under 18 years of age. If you believe a child has
        provided personal information, contact us at{" "}
        <BusinessEmailLink className="underline underline-offset-4" />.
      </p>

      <hr />

      <h2 id="your-rights">Your privacy choices and rights</h2>
      <p>
        <strong>In Short:</strong>{" "}
        <em>Depending on your location, you may have rights to access, correct, or delete your personal information.</em>
      </p>

      <p>
        Depending on where you live, you may have certain rights under applicable privacy laws. These may include the
        right to request access to, correction of, or deletion of personal information we hold about you, and in some
        cases to object to certain processing.
      </p>

      <p>
        To make a request, contact us at{" "}
        <BusinessEmailLink className="underline underline-offset-4" />.
      </p>

      <p>
        <strong>Cookie preferences.</strong> Most browsers accept cookies by default. You can usually adjust your browser
        settings to remove or reject cookies. You can also update your consent choices in our{" "}
        <a href="#cookie-policy">Cookie Policy</a>.
      </p>

      <hr />

      <h2 id="updates">Updates to this notice</h2>
      <p>
        We may update this privacy notice from time to time to reflect changes in our practices or legal requirements.
        The updated version will be effective when posted.
      </p>

      <hr />

      <h2 id="contact">How to contact us</h2>
      <p>
        If you have questions about this notice, you may contact us by email at{" "}
        <BusinessEmailLink className="underline underline-offset-4" />, by phone at{" "}
        <BusinessPhone />, or by mail:
      </p>

      <BusinessAddressBlock />

      <hr />

      <h2 id="cookie-policy">Cookie Policy</h2>

      <h3>What is a cookie?</h3>
      <p>
        A cookie is a small data file stored on your computer, tablet, or smartphone. A cookie is not a program and
        cannot carry harmful malware or viruses.
      </p>

      <h3>How our website uses cookies</h3>
      <p>
        Cookies are essential for certain functionalities of our website. They also give us insights into your visit,
        allowing us to continuously improve and tailor your experience based on your preferences and interests.
      </p>

      <p>We categorize cookies into these areas:</p>
      <ol>
        <li>Strictly Necessary</li>
        <li>Preferences</li>
        <li>Analytics</li>
      </ol>

      <h3>Managing, deleting, or changing cookie consent</h3>
      <p>
        You can block some or all cookies by adjusting your browser settings. Blocking cookies may impact certain
        features of our website that rely on them. You can opt out of Google Analytics cookies here:{" "}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://tools.google.com/dlpage/gaoptout
        </a>
        .
      </p>

      <p>
        If you’ve previously accepted cookies, you can remove them at any time. Instructions vary by browser/device.
      </p>

      <ul>
        <li>
          <a
            href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d"
            target="_blank"
            rel="noopener noreferrer"
          >
            Microsoft Edge / Internet Explorer
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mozilla Firefox
          </a>
        </li>
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647?hl=en"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/en-us/105082"
            target="_blank"
            rel="noopener noreferrer"
          >
            Safari (Apple)
          </a>
        </li>
        <li>
          <a
            href="https://discover.hubpages.com/technology/How-to-delete-internet-cookies-on-your-Droid-or-any-Android-device"
            target="_blank"
            rel="noopener noreferrer"
          >
            Android
          </a>
        </li>
      </ul>

      <p>
        You can also update your cookie preferences using this link:{" "}
        <CookiePreferencesLink />
      </p>

      <p>
        <strong>Note:</strong> If you use multiple browsers, you will need to adjust settings for each one individually.
      </p>

      <h3>Questions?</h3>
      <p>
        For inquiries or comments regarding our cookie policy or data processing practices, feel free to contact us
        using the contact details on this page.
      </p>
    </>
  );
}