import heroImage from '../../assets/hero.jpg';

export default function LoginHeroBackground({ image = heroImage, className = '' }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 bg-sidebar bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${image})` }}
    />
  );
}
