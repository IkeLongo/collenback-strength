const { LEGAL_COMPANY_NAME } = process.env;
const { DBA_NAME } = process.env;
const { SITE_NAME_VAR } = process.env;
const { BUSINESS_EMAIL } = process.env;

export async function PrivacyNotice() {
  return (
    <section id="privacy-notice">
      <h4 className="text-navy-975 font-semibold">Privacy Notice</h4>
      <p className="mt-4 text-navy-975 text-left">
        This privacy notice for <strong>{LEGAL_COMPANY_NAME}</strong> (doing business as <strong>{DBA_NAME} </strong> 
        (“Company,” “we,” “us,” or “our”), describes how and why we might collect, store, use, and/or share 
        (“process“) your information when you use our services (“Services“), such as when you:
      </p>
      <ul className="list-disc pl-6 mt-2 text-left">
        <li>Visit our website at <a href={SITE_NAME_VAR} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"> {SITE_NAME_VAR} </a> , or any website of ours that links to this privacy notice</li>
        <li>Engage with us in other related ways ― including any sales, marketing, or events</li>
      </ul>
      <p className="mt-4 text-navy-975 text-left">
        Questions or concerns? Reading this privacy notice will help you understand your privacy rights and choices. 
        If you do not agree with our policies and practices, please do not use our Services. If you still have any 
        questions or concerns, please contact us at{' '}
        <a href={`mailto:${BUSINESS_EMAIL}`} className="text-blue-500 hover:underline">
          {BUSINESS_EMAIL}
        </a>
      </p>
      <p className="mt-4 text-navy-975 text-left">
        This privacy policy was created by <a href="https://termly.io/products/privacy-policy-generator/" className="text-blue-500 hover:underline">Termly’s Privacy Policy Generator.</a>
      </p>
    </section>
  )
}