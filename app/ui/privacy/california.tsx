const { DBA_NAME } = process.env;
const { BUSINESS_EMAIL } = process.env;

export async function California() {
  return (
    <section id="do-california-residents-have-specific-privacy-rights" className="mt-8">
      <h4 className="text-navy-975">14. Do California Residents Have Specific Privacy Rights?</h4>
      <p className="mt-6 text-navy-975 text-left"><strong>In Short:</strong> <span className="italic">Yes, if you are a resident of California, you are granted specific rights regarding access to your personal information.</span></p>
      
      <p className="mt-4 text-navy-975 text-left">California Civil Code Section 1798.83, also known as the “Shine The Light” law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year. If you are a California resident and would like to make such a request, please submit your request in writing to us using the contact information provided below.</p>
      <p className="mt-4 text-navy-975 text-left">If you are under 18 years of age, reside in California, and have a registered account with Services, you have the right to request removal of unwanted data that you publicly post on the Services. To request removal of such data, please contact us using the contact information provided below and include the email address associated with your account and a statement that you reside in California. We will make sure the data is not publicly displayed on the Services, but please be aware that the data may not be completely or comprehensively removed from all our systems (e.g., backups, etc.).</p>

      <p className="text-center font-bold uppercase text-navy-975 mt-6">CCPA Privacy Notice</p>
      <p className="mt-4 text-navy-975 text-left">The California Code of Regulations defines a “resident” as:</p>
      <p className="mt-4 text-navy-975 text-left">(1) every individual who is in the State of California for other than a temporary or transitory purpose and</p>
      <p className="mt-4 text-navy-975 text-left">(2) every individual who is domiciled in the State of California who is outside the State of California for a temporary or transitory purpose</p>
      <p className="mt-4 text-navy-975 text-left">All other individuals are defined as “non-residents.”</p>
      <p className="mt-4 text-navy-975 text-left">If this definition of “resident” applies to you, we must adhere to certain rights and obligations regarding your personal information.</p>

      <p className="text-center font-bold uppercase text-navy-975 mt-6">What categories of personal information do we collect?</p>
      <p className="mt-4 text-navy-975 text-left">We have collected the following categories of personal information in the past twelve (12) months:</p>
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-navy-500">
              <th className="px-4 py-2 text-left font-medium text-gray-400 border border-gray-200">Category</th>
              <th className="px-4 py-2 text-left font-medium text-gray-400 border border-gray-200">Description</th>
              <th className="px-4 py-2 text-left font-medium text-gray-400 border border-gray-200">Collected</th>
            </tr>
          </thead>
          <tbody>
            <tr className="even:bg-white">
              <td className="px-4 py-2 border border-gray-200">A. Identifiers</td>
              <td className="px-4 py-2 border border-gray-200">Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name</td>
              <td className="px-4 py-2 border border-gray-200">YES</td>
            </tr>
            <tr className="">
              <td className="px-4 py-2 border border-gray-200">B. Personal information categories listed in the California Customer Records statute</td>
              <td className="px-4 py-2 border border-gray-200">Name, contact information, education, employment, employment history, and financial information</td>
              <td className="px-4 py-2 border border-gray-200">NO</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="px-4 py-2 border border-gray-200">C. Protected classification characteristics under California or federal law</td>
              <td className="px-4 py-2 border border-gray-200">Gender and date of birth</td>
              <td className="px-4 py-2 border border-gray-200">NO</td>
            </tr>
            <tr className="">
              <td className="px-4 py-2 border border-gray-200">D. Commercial information</td>
              <td className="px-4 py-2 border border-gray-200">Transaction information, purchase history, financial details, and payment information</td>
              <td className="px-4 py-2 border border-gray-200">NO</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="px-4 py-2 border border-gray-200">E. Biometric information</td>
              <td className="px-4 py-2 border border-gray-200">Fingerprints and voiceprints</td>
              <td className="px-4 py-2 border border-gray-200">NO</td>
            </tr>
            <tr className="">
              <td className="px-4 py-2 border border-gray-200">F. Internet or other similar network activity</td>
              <td className="px-4 py-2 border border-gray-200">Browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements</td>
              <td className="px-4 py-2 border border-gray-200">YES</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="px-4 py-2 border border-gray-200">G. Geolocation data</td>
              <td className="px-4 py-2 border border-gray-200">Device location</td>
              <td className="px-4 py-2 border border-gray-200">YES</td>
            </tr>
            <tr className="">
              <td className="px-4 py-2 border border-gray-200">H. Audio, electronic, visual, thermal, olfactory, or similar information</td>
              <td className="px-4 py-2 border border-gray-200">Images and audio, video or call recordings created in connection with our business activities</td>
              <td className="px-4 py-2 border border-gray-200">NO</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="px-4 py-2 border border-gray-200">I. Professional or employment-related information</td>
              <td className="px-4 py-2 border border-gray-200">Business contact details in order to provide you our services at a business level or job title, work history, and professional qualifications if you apply for a job with us</td>
              <td className="px-4 py-2 border border-gray-200">NO</td>
            </tr>
            <tr className="">
              <td className="px-4 py-2 border border-gray-200">J. Education Information</td>
              <td className="px-4 py-2 border border-gray-200">Student records and directory information</td>
              <td className="px-4 py-2 border border-gray-200">NO</td>
            </tr>
            <tr className="even:bg-gray-50">
              <td className="px-4 py-2 border border-gray-200">K. Inferences drawn from other personal information</td>
              <td className="px-4 py-2 border border-gray-200">Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual’s preferences and characteristics</td>
              <td className="px-4 py-2 border border-gray-200">YES</td>
            </tr>
            <tr className="">
              <td className="px-4 py-2 border border-gray-200">L. Sensitive personal information</td>
              <td className="px-4 py-2 border border-gray-200">Account login information, drivers’ licenses, health data, precise geolocation, racial or ethnic origin, religious or philosophical beliefs, and sex life or sexual orientation</td>
              <td className="px-4 py-2 border border-gray-200">NO</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-navy-975 text-left">We will use and retain the collected personal information as needed to provide the Services or for:</p>
      <ul className="list-disc pl-6 mt-4 flex flex-col gap-2">
        <li>Category A – 26 months</li>
        <li>Category B – N/A</li>
        <li>Category C – N/A</li>
        <li>Category D – N/A</li>
        <li>Category E – N/A</li>
        <li>Category F – 26 months</li>
        <li>Category G – 26 months</li>
        <li>Category H – N/A</li>
        <li>Category I – N/A</li>
        <li>Category J – N/A</li>
        <li>Category K – 26 months</li>
        <li>Category L – N/A</li>
      </ul>
      <p className="mt-4 text-navy-975 text-left">Category L information may be used, or disclosed to a service provider or contractor, for additional, specified purposes. You have the right to limit the use or disclosure of your sensitive personal information.</p>
      <p className="mt-4 text-navy-975 text-left">We may also collect other personal information outside of these categories instances where you interact with us in person, online, or by phone or mail in the context of:</p>
      <ul className="list-disc pl-6 mt-4 flex flex-col gap-2">
        <li>Receiving help through our customer support channels;</li>
        <li>Participation in customer surveys or contests; and</li>
        <li>Facilitation in the delivery of our Services and to respond to your inquiries.</li>
      </ul>

      <p className="text-center font-bold uppercase text-navy-975 mt-6">How do we use and share your personal information?</p>
      <p className="mt-4 text-navy-975 text-left">{DBA_NAME} collects and shares your personal information through:</p>
      <ul className="list-disc pl-6 mt-4 flex flex-col gap-2">
        <li>Targeting cookies/Marketing cookies</li>
        <li>Social media cookies</li>
        <li>Beacons/Pixels/Tags</li>
        <li>Click redirects:</li>
        <li>Social media plugins:  We use social media features, such as a “Like” button, and widgets, such as a “Share” button in our Services. Such features may process your Internet Protocol (IP) address and track which page you are visiting on our website. We may place a cookie to enable the feature to work correctly. If you are logged in on a certain social media platform and you interact with a widget or button belonging to that social media platform, this information may be recorded to your profile of such social media platform. To avoid this, you should log out from that social media platform before accessing or using the Services. Social media features and widgets may be hosted by a third party or hosted directly on our Services. Your interactions with these features are governed by the privacy notices of the companies that provide them. By clicking on one of these buttons, you agree to the use of this plugin and consequently the transfer of personal information to the corresponding social media service. We have no control over the essence and extent of these transmitted data or their additional processing.</li>
      </ul>
      <p className="mt-4 text-navy-975 text-left">More information about our data collection and sharing practices can be found in this privacy notice and our <a href="#cookie-policy" className="text-blue-500 hover:underline">Cookie Policy</a>.</p>
      <p className="mt-4 text-navy-975 text-left">You can opt out from the selling or sharing of your personal information by disabling cookies in Cookie Preference Settings.</p>
      <p className="mt-4 text-navy-975 text-left">You may contact us by email at{' '}
        <a href={`mailto:${BUSINESS_EMAIL}`} className="text-blue-500 hover:underline">
          {BUSINESS_EMAIL}
        </a>, by calling toll-free at 210-730-6232, by visiting <a href="#dpo-contact-form" className="text-blue-500 hover:underline">our Contact Form</a>, or by referring to the contact details at the bottom of this document.</p>
      <p className="mt-4 text-navy-975 text-left">If you are using an authorized agent to exercise your right to opt out we may deny a request if the authorized agent does not submit proof that they have been validly authorized to act on your behalf.</p>

      <p className="text-center font-bold uppercase text-navy-975 mt-6">Will your information be shared with anyone else?</p>
      <p className="mt-4 text-navy-975 text-left">We may disclose your personal information with our service providers pursuant to a written contract between us and each service provider. Each service provider is a for-profit entity that processes the information on our behalf, following the same strict privacy protection obligations mandated by the CCPA.</p>
      <p className="mt-4 text-navy-975 text-left">We may use your personal information for our own business purposes, such as for undertaking internal research for technological development and demonstration. This is not considered to be “selling” of your personal information.</p>
      <p className="mt-4 text-navy-975 text-left">RiverCity Creatives has disclosed the following categories of personal information to third parties for a business or commercial purpose in the preceding twelve (12) months:</p>
      <ul className="list-disc pl-6 mt-4 flex flex-col gap-2">
        <li>Category A. Identifiers, such as contact details like your real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name.</li>
        <li>Category B. Personal information, as defined in the California Customer Records law, such as your name, contact information, education, employment, employment history, and financial information.</li>
        <li>Category C. Characteristics of protected classifications under California or federal law, such as gender or date of birth.</li>
        <li>Category D. Commercial information, such as transaction information, purchase history, financial details, and payment information.</li>
        <li>Category E. Biometric information, such as fingerprints and voiceprints.</li>
        <li>Category F. Internet or other electronic network activity information, such as browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements.</li>
        <li>Category G. Geolocation data, such as device location.</li>
        <li>Category H. Audio, electronic, visual, and similar information, such as images and audio, video, or call recordings created in connection with our business activities.</li>
        <li>Category I. Professional or employment-related information, such as business contact details in order to provide you our services at a business level or job title, work history, and professional qualifications if you apply for a job with us.</li>
        <li>Category J. Education information, such as student records and directory information.</li>
        <li>Category K. Inferences drawn from any of the personal information listed above to create a profile or summary about, for example, an individual’s preferences and characteristics.</li>
        <li>Category L. Sensitive personal information, such as account login information, drivers’ licenses, health data, precise geolocation, racial or ethnic origin, religious or philosophical beliefs, and sex life or sexual orientation.</li>
      </ul>
      <p className="mt-4 text-navy-975 text-left">The categories of third parties to whom we disclosed personal information for a business or commercial purpose can be found under <a href="#when-and-with-whom-do-we-share-your-personal-information" className="text-blue-500 hover:underline">When and with Whom do we Share your Personal Information?</a>.</p>
      <p className="mt-4 text-navy-975 text-left">RiverCity Creatives has not sold or shared any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months.</p>
      <ul className="list-disc pl-6 mt-4 flex flex-col gap-2">
        <li>Category A. Identifiers, such as contact details like your real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name.</li>
        <li>Category B. Personal information, as defined in the California Customer Records law, such as your name, contact information, education, employment, employment history, and financial information.</li>
        <li>Category C. Characteristics of protected classifications under California or federal law, such as gender or date of birth.</li>
        <li>Category D. Commercial information, such as transaction information, purchase history, financial details, and payment information.</li>
        <li>Category E. Biometric information, such as fingerprints and voiceprints.</li>
        <li>Category F. Internet or other electronic network activity information, such as browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements.</li>
        <li>Category G. Geolocation data, such as device location.</li>
        <li>Category H. Audio, electronic, visual, and similar information, such as images and audio, video, or call recordings created in connection with our business activities.</li>
        <li>Category I. Professional or employment-related information, such as business contact details in order to provide you our services at a business level or job title, work history, and professional qualifications if you apply for a job with us.</li>
        <li>Category J. Education information, such as student records and directory information.</li>
        <li>Category K. Inferences drawn from any of the personal information listed above to create a profile or summary about, for example, an individual’s preferences and characteristics.</li>
        <li>Category L. Sensitive personal information, such as account login information, drivers’ licenses, health data, precise geolocation, racial or ethnic origin, religious or philosophical beliefs, and sex life or sexual orientation.</li>
      </ul>

      <p className="text-center font-bold uppercase text-navy-975 mt-6">Your rights with respect to your personal data</p>
      <p className="mt-4 text-navy-975 text-left"><strong>Right to request deletion of the data — Request to delete</strong></p>
      <p className="mt-4 text-navy-975 text-left">You can ask for the deletion of your personal information. If you ask us to delete your personal information, we will respect your request and delete your personal information, subject to certain exceptions provided by law, such as (but not limited to) the exercise by another consumer of his or her right to free speech, our compliance requirements resulting from a legal obligation, or any processing that may be required to protect against illegal activities.</p>
      <p className="mt-4 text-navy-975 text-left"><strong>Right to be informed — Request to know</strong></p>
      <p className="mt-4 text-navy-975 text-left">Depending on the circumstances, you have a right to know:</p>
      <ul className="list-disc pl-6 mt-4 flex flex-col gap-2">
        <li>whether we collect and use your personal information;</li>
        <li>the categories of personal information that we collect;</li>
        <li>the purposes for which the collected personal information is used;</li>
        <li>whether we sell or share personal information to third parties;</li>
        <li>the categories of personal information that we sold, shared, or disclosed for a business purpose;</li>
        <li>the categories of third parties to whom the personal information was sold, shared, or disclosed for a business purpose;</li>
        <li>the business or commercial purpose for collecting, sharing, or selling personal information; and</li>
        <li>the specific pieces of personal information we collected about you.</li>
      </ul>
      <p className="mt-4 text-navy-975 text-left">In accordance with applicable law, we are not obligated to provide or delete consumer information that is de-identified in response to a consumer request or to re-identify individual data to verify a consumer request.</p>
      <p className="mt-4 text-navy-975 text-left"><strong>Right to Non-Discrimination for the Exercise of a Consumer’s Privacy Rights</strong></p>
      <p className="mt-4 text-navy-975 text-left">We will not discriminate against you if you exercise your privacy rights.</p>
      <p className="mt-4 text-navy-975 text-left"><strong>Right to Limit Use and Disclosure of Sensitive Personal Information</strong></p>
      <p className="mt-4 text-navy-975 text-left">We do not process consumer’s sensitive personal information.</p>
      <p className="mt-4 text-navy-975 text-left"><strong>Verification process</strong></p>
      <p className="mt-4 text-navy-975 text-left">Upon receiving your request, we will need to verify your identity to determine you are the same person about whom we have the information in our system. These verification efforts require us to ask you to provide information so that we can match it with information you have previously provided us. For instance, depending on the type of request you submit, we may ask you to provide certain information so that we can match the information you provide with the information we already have on file, or we may contact you through a communication method (e.g., phone or email) that you have previously provided to us. We may also use other verification methods as the circumstances dictate.</p>
      <p className="mt-4 text-navy-975 text-left">We will only use personal information provided in your request to verify your identity or authority to make the request. To the extent possible, we will avoid requesting additional information from you for the purposes of verification. However, if we cannot verify your identity from the information already maintained by us, we may request that you provide additional information for the purposes of verifying your identity and for security or fraud-prevention purposes. We will delete such additionally provided information as soon as we finish verifying you.</p>
      <p className="mt-4 text-navy-975 text-left"><strong>Other privacy rights</strong></p>
      <ul className="list-disc pl-6 mt-4 flex flex-col gap-2">
        <li>You may object to the processing of your personal information.</li>
        <li>You may request correction of your personal data if it is incorrect or no longer relevant, or ask to restrict the processing of the information.</li>
        <li>You can designate an authorized agent to make a request under the CCPA on your behalf. We may deny a request from an authorized agent that does not submit proof that they have been validly authorized to act on your behalf in accordance with the CCPA.</li>
        <li>You may request to opt out from future selling or sharing of your personal information to third parties. Upon receiving an opt-out request, we will act upon the request as soon as feasibly possible, but no later than fifteen (15) days from the date of the request submission.</li>
      </ul>
      <p className="mt-4 text-navy-975 text-left">To exercise these rights, you can contact us by email at{' '}
        <a href={`mailto:${BUSINESS_EMAIL}`} className="text-blue-500 hover:underline">
          {BUSINESS_EMAIL}
        </a>, by calling toll-free at 210-730-6232, by visiting <a href="#dpo-contact-form" className="text-blue-500 hover:underline">our Contact Form</a>, or by referring to the contact details at the bottom of this document. If you have a complaint about how we handle your data, we would like to hear from you.</p>

      <p className="text-center font-bold uppercase text-navy-975 mt-6">Financial Incentives</p>
      <p className="mt-4 text-navy-975 text-left">“Financial incentive” means a program, benefit, or other offering, including payments to consumers as compensation, for the disclosure, deletion, sharing, or sale of personal information.</p>
      <p className="mt-4 text-navy-975 text-left">The law permits financial incentives or a price or service difference if it is reasonably related to the value of the consumer’s data. A business must be able to explain how the financial incentive or price or service difference is reasonably related to the value of the consumer’s data. The explanation must include:</p>
      <ul className="list-disc pl-6 mt-4 flex flex-col gap-2">
        <li>a good-faith estimate of the value of the consumer’s data that forms the basis for offering the financial incentive or price or service difference; and</li>
        <li>a description of the method the business used to calculate the value of the consumer’s data.</li>
      </ul>
      <p className="mt-4 text-navy-975 text-left">We may decide to offer a financial incentive (e.g., price or service difference) in exchange for the retention, sale or sharing of a consumer’s personal information.</p>
      <p className="mt-4 text-navy-975 text-left">If we decide to offer a financial incentive, we will notify you of such financial incentive and explain the price difference, as well as material terms of the financial incentive or price of service difference, including the categories of personal information that are implicated by the financial incentive or price or service difference.</p>
      <p className="mt-4 text-navy-975 text-left">If you choose to participate in the financial incentive you can withdraw from the financial incentive at any time by emailing us at{' '}
        <a href={`mailto:${BUSINESS_EMAIL}`} className="text-blue-500 hover:underline">
          {BUSINESS_EMAIL}
        </a>, by calling us toll-free at 210-730-6232, by visiting <a href="#dpo-contact-form" className="text-blue-500 hover:underline">our Contact Form</a>, or by referring to the contact details at the bottom of this document.</p>

      <p className="text-center font-bold uppercase text-navy-975 mt-6">Metrics</p>
      <p className="mt-4 text-navy-975 text-left">Our metrics for all CCPA requests received for the previous calendar year can be found here: [Metrics URL].</p>
    </section>
  )
}