// Logos oficiales de bancos desde archivos locales
export const BankIcons = {
  // Bancos venezolanos
  banesco: () => (
    <img 
      src="/Bank Icons/Banesco Icon.png"  
      alt="Banesco" 
      className="h-6 w-10 object-contain" 
    />
  ),
  
  mercantil: () => (
    <img 
      src="/Bank Icons/Mercantil Icon.png" 
      alt="Banco Mercantil" 
      className="h-6 w-10 object-contain" 
    />
  ),
  
  provincial: () => (
    <img 
      src="/Bank Icons/BBVA Icon.png" 
      alt="BBVA Provincial" 
      className="h-6 w-10 object-contain" 
    />
  ),
  
  venezuela: () => (
    <img 
      src="/Bank Icons/BDV Icon.png" 
      alt="Banco de Venezuela" 
      className="h-6 w-10 object-contain" 
    />
  ),
  
  bdt: () => (
    <img 
      src="/Bank Icons/BDT Icon.png" 
      alt="BDT Banco de los Trabajadores" 
      className="h-6 w-10 object-contain" 
    />
  ),
  
  tesoro: () => (
    <img 
      src="/Bank Icons/Banco del Tesoro Icon.png" 
      alt="Banco del Tesoro" 
      className="h-6 w-10 object-contain" 
    />
  ),
  
  exterior: () => (
    <img 
      src="/Bank Icons/Banco Exterior Icon.png" 
      alt="Banco Exterior" 
      className="h-6 w-10 object-contain" 
    />
  ),
  
  // Tarjetas internacionales
  visa: () => (
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/320px-Visa_Inc._logo.svg.png" 
      alt="Visa" 
      className="h-6 w-10 object-contain" 
    />
  ),
  
  mastercard: () => (
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/320px-Mastercard-logo.svg.png" 
      alt="MasterCard" 
      className="h-6 w-10 object-contain" 
    />
  ),
  
  amex: () => (
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/320px-American_Express_logo_%282018%29.svg.png" 
      alt="American Express" 
      className="h-6 w-10 object-contain" 
    />
  )
};

export const getBankIcon = (cardType) => {
  const IconComponent = BankIcons[cardType];
  return IconComponent ? (
    <div className="flex items-center justify-center w-12 h-8 bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
      <IconComponent />
    </div>
  ) : null;
};