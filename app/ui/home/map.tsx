export default function Map() {
  return (
    <section className="flex flex-col w-full max-w-[450px] md:max-w-[834px] lg:max-w-[1220px] mx-auto px-4 py-16 md:py-18 lg:py-24">
      <div className="flex flex-col items-center gap-6">
        <h3 className="text-2xl md:text-3xl font-bold text-center">
          Where to Find Me
        </h3>
        <div className="w-full max-w-2xl rounded-lg overflow-hidden shadow-lg">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3470.0868545975936!2d-98.69001703614012!3d29.57207608385204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x865c68e84aa02659%3A0x8f9af5fec59c0d7c!2s13875%20Riggs%20Rd%2C%20Helotes%2C%20TX%2078023%2C%20USA!5e0!3m2!1sen!2sca!4v1752175274882!5m2!1sen!2sca" 
            width="100%" 
            height="400" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Cade Collenback Strength Location - 13875 Riggs Rd, Helotes, TX"
            className="w-full h-[300px] md:h-[400px]"
          />
        </div>
        <div className="text-center">
          <p className="text-grey-100 mb-2 !text-[16px]">
            13875 Riggs Rd, Helotes, TX 78023
          </p>
          <p className="text-sm text-grey-400 !text-[16px]">
            (Located across from Helotes Elementary)
          </p>
        </div>
      </div>
    </section>
  );
}