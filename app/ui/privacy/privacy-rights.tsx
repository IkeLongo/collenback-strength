const { BUSINESS_EMAIL } = process.env;

export async function PrivacyRights() {
  return (
    <section id="what-are-your-privacy-rights" className="mt-8">
      <h4 className="text-navy-975">12. What Are Your Privacy Rights?</h4>
      <p className="mt-6 text-navy-975 text-left"><strong>In Short:</strong> <span className="italic">In some regions, such as the European Economic Area (EEA), United Kingdom (UK), and Canada, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.</span></p>
      
      <p className="mt-4 text-navy-975 text-left">In some regions (like the EEA, UK, and Canada), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section <a href="#how-can-you-contact-us-about-this-notice" className="text-blue-500 hover:underline">How can you Contact us About this Notice?</a> below.</p>
      <p className="mt-4 text-navy-975 text-left">We will consider and act upon any request in accordance with applicable data protection laws.</p>
      <p className="mt-4 text-navy-975 text-left">If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your local data protection supervisory authority. You can find their contact details <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" className="text-blue-500 hover:underline">here.</a></p>
      <p className="mt-4 text-navy-975 text-left">If you are located in Switzerland, the contact details for the data protection authorities are available <a href="https://www.edoeb.admin.ch/edoeb/en/home.html" className="text-blue-500 hover:underline">here.</a></p>
      <p className="mt-6 text-navy-975 text-left"><strong>Withdrawing your consent: </strong> If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section <a href="#how-can-you-contact-us-about-this-notice" className="text-blue-500 hover:underline">How can you Contact us About this Notice?</a> below or updating your preferences.</p>
      <p className="mt-4 text-navy-975 text-left">However, please note that this will not affect the lawfulness of the processing before its withdrawal, nor when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.</p>
      <p className="mt-6 text-navy-975 text-left"><strong>Opting out of marketing and promotional communications: </strong>You can unsubscribe from our marketing and promotional communications at any time by clicking on the unsubscribe link in the emails that we send, replying “STOP” or “UNSUBSCRIBE” to the SMS messages that we send, or by contacting us using the details provided in the section <a href="#how-can-you-contact-us-about-this-notice" className="text-blue-500 hover:underline">How can you Contact us About this Notice?</a> below. You will then be removed from the marketing lists — however, we may still communicate with you, for example to send you service-related messages that are necessary for the administration and use of your account, to respond to service requests, or for other non-marketing purposes.</p>
      <p className="text-center font-bold uppercase text-navy-975 mt-6">Account Information</p>
      <p className="mt-4 text-navy-975 text-left">If you would at any time like to review or change the information in your account or terminate your account, you can:</p>
      <ul className="list-disc pl-6 mt-4 flex flex-col gap-2">
        <li>Log in to your account settings and update your user account.</li>
        <li>Contact us using the contact information provided.</li>
      </ul>
      <p className="mt-4 text-navy-975 text-left">Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.</p>
      <p className="mt-6 text-navy-975 text-left"><strong>Cookies and similar technologies: </strong>Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Services. To opt out of interest-based advertising by advertisers on our Services click <a href="http://www.aboutads.info/choices/" className="text-blue-500 hover:underline">here</a>. For further information, please see our <a href="#cookie-policy" className="text-blue-500 hover:underline">Cookie Policy</a>.</p>
      <p className="mt-4 text-navy-975 text-left">If you have questions or comments about your privacy rights, you may email us at{' '}
         <a href={`mailto:${BUSINESS_EMAIL}`} className="text-blue-500 hover:underline">
          {BUSINESS_EMAIL}
        </a>.
      </p>
    </section>
  )
}