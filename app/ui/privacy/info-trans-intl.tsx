const { DBA_NAME } = process.env;

export async function InfoTranIntl() {
  return (
    <section id="is-your-information-transferred-internationally" className="mt-8">
      <h4 className="text-navy-975">8. Is Your Information Transfered Internationaly?</h4>
      <p className="mt-6 text-navy-975 text-left"><strong>In Short:</strong> <span className="italic">We may transfer, store, and process your information in countries other than your own.</span></p>
      
      <p className="mt-4 text-navy-975 text-left">Our servers are located in the United States of America. If you are accessing our Services from outside the United States of America, please be aware that your information may be transferred to, stored, and processed by us in our facilities and by those third parties with whom we may share your personal information see <a href="#when-and-with-whom-do-we-share-your-personal-information" className="text-blue-500 hover:underline">When and with Whom do we Share Your Personal Information?</a> above, in other countries.</p>
      <p className="mt-4 text-navy-975 text-left">If you are a resident in the European Economic Area (EEA) or United Kingdom (UK), then these countries may not necessarily have data protection laws or other similar laws as comprehensive as those in your country. However, we will take all necessary measures to protect your personal information in accordance with this privacy notice and applicable law.</p>
      <p className="mt-4 text-navy-975 text-left">European Commission’s Standard Contractual Clauses:</p>
      <p className="my-4 text-navy-975 text-left">We have implemented measures to protect your personal information, including by using the European Commission’s Standard Contractual Clauses for transfers of personal information between our group companies and between us and our third-party providers. These clauses require all recipients to protect all personal information that they process originating from the EEA or UK in accordance with European data protection laws and regulations. Our Data Processing Agreements that include Standard Contractual Clauses are available here. We have implemented similar appropriate safeguards with our third-party service providers and partners and further details can be provided upon request.</p>
      <strong className="mt-4 text-navy-975 text-left">Internation Data Transfers:</strong>
      <p className="mt-4 text-navy-975 text-left">{DBA_NAME} is committed to protecting personal information during international transfers. While we do not currently operate under Binding Corporate Rules (BCRs), we ensure that all data transfers comply with applicable data protection laws, including the General Data Protection Regulation (GDPR) and the UK Data Protection Act. For international transfers outside the European Economic Area (EEA), the UK, and Switzerland, we rely on approved mechanisms such as Standard Contractual Clauses (SCCs) and other appropriate safeguards to ensure an adequate level of protection for your personal information.</p>
      <p className="mt-4 text-navy-975 text-left">If you have any questions or would like more information about how we protect personal information during international transfers, please contact us using the details provided below.</p>
    </section>
  )
}