const { DBA_NAME } = process.env;
const { BUSINESS_EMAIL } = process.env;

export async function Virginia() {
  return (
    <section id="do-virginia-residents-have-specific-privacy-rights" className="mt-8">
      <h4 className="text-navy-975">15. Do Virginia Residents Have Specific Privacy Rights?</h4>
      <p className="mt-6 text-navy-975 text-left"><strong>In Short:</strong> <span className="italic">Yes, if you are a resident of Virginia, you may be granted specific rights regarding access to and use of your personal information.</span></p>
      
      <p className="text-center font-bold uppercase text-navy-975 mt-6">Virginia CDPA Privacy Notice</p>
      <p className="mt-4 text-navy-975 text-left">Under the Virginia Consumer Data Protection Act (CDPA):</p>
      <p className="mt-4 text-navy-975 text-left">“Consumer” means a natural person who is a resident of the Commonwealth acting only in an individual or household context. It does not include a natural person acting in a commercial or employment context.</p>
      <p className="mt-4 text-navy-975 text-left">“Personal data” means any information that is linked or reasonably linkable to an identified or identifiable natural person. “Personal data” does not include de-identified data or publicly available information.</p>
      <p className="mt-4 text-navy-975 text-left">“Sale of personal data” means the exchange of personal data for monetary consideration.</p>
      <p className="mt-4 text-navy-975 text-left">If this definition of “consumer” applies to you, we must adhere to certain rights and obligations regarding your personal data.</p>
      <p className="mt-4 text-navy-975 text-left">The information we collect, use, and disclose about you will vary depending on how you interact with {DBA_NAME} and our Services. To find out more, please visit the following sections above:</p>
      <ol className="list-decimal pl-6 mt-4 flex flex-col gap-2">
        <li><a href="#what-information-do-we-collect" className="text-blue-500 hover:underline">What Information do we Collect?</a></li>
        <li><a href="#how-do-we-process-your-information" className="text-blue-500 hover:underline">How do we Process your Information?</a></li>
        <li style={{ listStyleType: 'none' }}>
          <span className="before:content-['4.'] before:-ml-[18px] before:mr-1">
            <a href="#when-and-with-whom-do-we-share-your-personal-information" className="text-blue-500 hover:underline">When and with Whom do we Share your Personal Information</a>
          </span>
        </li>
      </ol>
      <p className="mt-4 text-navy-975 text-left"><strong>Your rights with respect to your personal data</strong></p>
      <ul className="list-disc pl-6 mt-4 flex flex-col gap-2">
        <li>Right to be informed whether or not we are processing your personal data</li>
        <li>Right to access your personal data</li>
        <li>Right to correct inaccuracies in your personal data</li>
        <li>Right to request deletion of your personal data</li>
        <li>Right to obtain a copy of the personal data you previously shared with us</li>
        <li>Right to opt out of the processing of your personal data if it is used for targeted advertising, the sale of personal data, or profiling in furtherance of decisions that produce legal or similarly significant effects.</li>
      </ul>
      <p className="mt-4 text-navy-975 text-left">{DBA_NAME} has not sold any personal data to third parties for business or commercial purposes. {DBA_NAME} will not sell personal data in the future belonging to website visitors, users, and other consumers. </p>
      <p className="mt-4 text-navy-975 text-left"><strong>Exercise your rights provided under the Virginia CDPA</strong></p>
      <p className="mt-4 text-navy-975 text-left">More information about our data collection and sharing practices can be found in this privacy notice and our <a href="#cookie-policy" className="text-blue-500 hover:underline">Cookie Policy</a>.</p>
      <p className="mt-4 text-navy-975 text-left">You may contact us by email at{' '}
        <a href={`mailto:${BUSINESS_EMAIL}`} className="text-blue-500 hover:underline">
          {BUSINESS_EMAIL}
        </a>, by visiting <a href="#dpo-contact-form" className="text-blue-500 hover:underline">our Contact Form</a>, or by referring to the contact details at the bottom of this document.</p>
      <p className="mt-4 text-navy-975 text-left">If you are using an authorized agent to exercise your rights, we may deny a request if the authorized agent does not submit proof that they have been validly authorized to act on your behalf.</p>
      <p className="mt-4 text-navy-975 text-left"><strong>Verification process</strong></p>
      <p className="mt-4 text-navy-975 text-left">We may request that you provide additional information reasonably necessary to verify you and your consumer’s request. If you submit the request through an authorized agent, we may need to collect additional information to verify your identity before processing your request.</p>
      <p className="mt-4 text-navy-975 text-left">Upon receiving your request, we will respond without undue delay, but in all cases, within forty-five (45) days of receipt. The response period may be extended once by forty-five (45) additional days when reasonably necessary. We will inform you of any such extension within the initial 45-day response period, together with the reason for the extension.</p>
      <p className="mt-4 text-navy-975 text-left"><strong>Right to appeal</strong></p>
      <p className="mt-4 text-navy-975 text-left">If we decline to take action regarding your request, we will inform you of our decision and reasoning behind it. If you wish to appeal our decision, please email us at{' '}
        <a href={`mailto:${BUSINESS_EMAIL}`} className="text-blue-500 hover:underline">
          {BUSINESS_EMAIL}
        </a>. Within sixty (60) days of receipt of an appeal, we will inform you in writing of any action taken or not taken in response to the appeal, including a written explanation of the reasons for the decisions. If your appeal is denied, you may contact the Attorney General to <a href="https://www.oag.state.va.us/consumer-protection/index.php/file-a-complaint" className="text-blue-500 hover:underline">submit a complaint</a>.</p>
    </section>
  )
}