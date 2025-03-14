const ButtonSvg:React.FC = () => (
  <>
    <svg className="absolute top-0 left-0" width="21" height="44" viewBox="0 0 21 44">
      <defs>
        <linearGradient id="btn-left" x1="50%" x2="50%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#89F9E8" />
          <stop offset="100%" stopColor="#FACB7B" />
        </linearGradient>
        <linearGradient id="btn-top" x1="100%" x2="0%" y1="50%" y2="50%">
          <stop offset="0%" stopColor="#D87CEE" />
          <stop offset="100%" stopColor="#FACB7B" />
        </linearGradient>
        <linearGradient id="btn-bottom" x1="100%" x2="0%" y1="50%" y2="50%">
          <stop offset="0%" stopColor="#9099FC" />
          <stop offset="100%" stopColor="#89F9E8" />
        </linearGradient>
        <linearGradient id="btn-right" x1="14.635%" x2="14.635%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#9099FC" />
          <stop offset="100%" stopColor="#D87CEE" />
        </linearGradient>
      </defs>
      <path
        fill="none"
        stroke= "url(#btn-left)"
        strokeWidth="2"
        d="M21,43.00005 L8.11111,43.00005 C4.18375,43.00005 1,39.58105 1,35.36365 L1,8.63637 C1,4.41892 4.18375,1 8.11111,1 L21,1"
      />
    </svg>
    <svg
      className="absolute top-0 left-[1.3125rem] w-[calc(100%-2.625rem)]"
      height="44"
      viewBox="0 0 100 44"
      preserveAspectRatio="none"
      fill="none"
    >
      
        <>
          <polygon fill="url(#btn-top)" fillRule="nonzero" points="100 42 100 44 0 44 0 42" />
          <polygon fill="url(#btn-bottom)" fillRule="nonzero" points="100 0 100 2 0 2 0 0" />
        </>
    
    </svg>
    <svg className="absolute top-0 right-0" width="21" height="44" viewBox="0 0 21 44">
  <path
    fill="none"
    stroke="url(#btn-right)"
    strokeWidth="2"
    d="M21,43.00005 L8.11111,43.00005 C4.18375,43.00005 1,39.58105 1,35.36365 L1,8.63637 C1,4.41892 4.18375,1 8.11111,1 L21,1"
    transform="scale(-1,1) translate(-21, 0)"
  />
</svg>

  </>
);

export default ButtonSvg;