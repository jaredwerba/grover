import Image from "next/image";

export default function HeroLogo() {
  return (
    <Image
      src="/images/logotrans.png"
      alt="Cove"
      width={280}
      height={118}
      className="hero-logo block mb-6 relative z-10"
      priority
    />
  );
}
