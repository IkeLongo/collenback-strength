const { BUSINESS_EMAIL } = process.env;

export async function MinorInfo() {
  return (
    <section id="do-we-collect-information-from-minors" className="mt-8">
      <h4 className="text-navy-975">11. Do We Colect Information From Minors?</h4>
      <p className="mt-6 text-navy-975 text-left"><strong>In Short:</strong> <span className="italic">We do not knowingly collect data from or market to children under 18 years of age.</span></p>
      
      <p className="mt-4 text-navy-975 text-left">We do not knowingly solicit data from or market to children under 18 years of age. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at{' '}
        <a href={`mailto:${BUSINESS_EMAIL}`} className="text-blue-500 hover:underline">
          {BUSINESS_EMAIL}
        </a>.
      </p>
    </section>
  )
}