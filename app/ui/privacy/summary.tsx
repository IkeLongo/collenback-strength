const { LEGAL_COMPANY_NAME } = process.env;
const { BUSINESS_EMAIL } = process.env;

export async function Summary() {
  return (
    <section id="key-points" className="mt-8">
      <h4 className="text-navy-975">Summary of Key Points</h4>
      <p className="mt-4 italic text-navy-975 text-left">
        This summary provides key points from our privacy notice, but you can find out more details about any of these topics 
        by using our table of contents below to find the section you are looking for.
      </p>
      <ul className="list-none mt-2 flex flex-col gap-2">
        <li>
          <p className=" text-navy-975 text-left">
            <strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with {LEGAL_COMPANY_NAME} and the Services, the choices you make, and the products and features you use.
          </p>
        </li>
        <li>
          <p className=" text-navy-975 text-left">
            <strong>Do we process any sensitive personal information?</strong> We do not process sensitive personal information. 
          </p>
        </li>
        <li>
          <p className=" text-navy-975 text-left">
            <strong>Do you receive any information from third parties?</strong> We may receive information from third parties, such as social media platforms, advertising networks, and analytics providers.
          </p>
        </li>
        <li>
          <p className=" text-navy-975 text-left">
            <strong>How do you process my information?</strong> We process your information to provide, improve, and personalize our services, comply with legal obligations, and protect our rights.
          </p>
        </li>
        <li>
          <p className=" text-navy-975 text-left">
            <strong>In what situations and with which types of parties do we share personal information?</strong> We may share your information with service providers, business partners, and legal authorities as required by law.
          </p>
        </li>
        <li>
          <p className=" text-navy-975 text-left">
            <strong>How do we keep your information safe?</strong> We have organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.
          </p>
        </li>
        <li>
          <p className=" text-navy-975 text-left">
            <strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.
          </p>
        </li>
        <li>
          <p className=" text-navy-975 text-left">
            <strong>How do I exercise my rights?</strong> The easiest way to exercise your rights is by requesting a data subject request to our email,{' '}
            <a href={`mailto:${BUSINESS_EMAIL}`} className="text-blue-500 hover:underline">
              {BUSINESS_EMAIL}
            </a>
            . We will consider and act upon any request in accordance with applicable data protection laws.
          </p>
        </li>
      </ul>
    </section>
  )
}