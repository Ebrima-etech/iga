export default function GIALogoEngravings() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
      {/* GIA Logo 1 - Top Left */}
      <img
        src="https://strapi.yolcu360.com/gambia_airlines_logo_1_ebe63e51ad.png"
        alt="GIA"
        className="absolute top-12 left-12 w-20 h-20 object-contain opacity-15"
      />

      {/* GIA Logo 2 - Top Right */}
      <img
        src="https://strapi.yolcu360.com/gambia_airlines_logo_1_ebe63e51ad.png"
        alt="GIA"
        className="absolute top-20 right-24 w-16 h-16 object-contain opacity-15"
        style={{ transform: 'rotate(15deg)' }}
      />

      {/* GIA Logo 3 - Center */}
      <img
        src="https://strapi.yolcu360.com/gambia_airlines_logo_1_ebe63e51ad.png"
        alt="GIA"
        className="absolute top-1/2 left-1/2 w-32 h-32 object-contain opacity-15"
        style={{ transform: 'translate(-50%, -50%) rotate(-10deg)' }}
      />

      {/* GIA Logo 4 - Bottom Left */}
      <img
        src="https://strapi.yolcu360.com/gambia_airlines_logo_1_ebe63e51ad.png"
        alt="GIA"
        className="absolute bottom-20 left-16 w-24 h-24 object-contain opacity-15"
        style={{ transform: 'rotate(8deg)' }}
      />

      {/* GIA Logo 5 - Bottom Right */}
      <img
        src="https://strapi.yolcu360.com/gambia_airlines_logo_1_ebe63e51ad.png"
        alt="GIA"
        className="absolute bottom-16 right-20 w-28 h-28 object-contain opacity-15"
        style={{ transform: 'rotate(-12deg)' }}
      />
    </div>
  );
}
