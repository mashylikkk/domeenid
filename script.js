document.addEventListener("DOMContentLoaded", () => {
  // Array for storing selected domains with their durations
  let selectedDomains = [];
  // Base price for a domain (for 1 year)
  const baseDomainPrice = 8;
  
  const searchButton = document.querySelector('.button');
  const resultDiv = document.querySelector('.result');
  const edasiButton = document.querySelector('.btn-next');
  const tagasiButton = document.querySelector('.btn-back');
  
  // Handle step navigation clicks
  const setupStepNavigation = () => {
    // Get all clickable step elements
    const clickableSteps = document.querySelectorAll('.step-clickable');
    
    // Add click event listeners to each step
    clickableSteps.forEach(step => {
      step.addEventListener('click', () => {
        const targetPage = step.getAttribute('data-page');
        if (targetPage) {
          window.location.href = targetPage;
        }
      });
    });
  };
  
  // Initialize step navigation
  setupStepNavigation();
  
  // Function to get domain price based on duration
  function getDomainPrice(duration) {
    switch(parseInt(duration)) {
      case 1: return baseDomainPrice;
      case 2: return Math.round(baseDomainPrice * 1.8);
      case 3: return Math.round(baseDomainPrice * 2.5);
      case 5: return Math.round(baseDomainPrice * 4);
      default: return baseDomainPrice;
    }
  }
  
  // Function to update order summary in the pricing column
  function updateOrderSummary() {
    const pricingColumn = document.querySelector('.pricing-column');
    if (!pricingColumn) return;
    
    let totalPrice = 0;
    
    // Calculate total price based on each domain's selected duration
    selectedDomains.forEach(domain => {
      totalPrice += getDomainPrice(domain.duration);
    });
    
    // Update information in the order block
    let orderHTML = `
      <h3 class="pricing-title">Tellimus</h3>
      <div class="pricing-content">
        <div class="pricing-label">Domeenid: ${selectedDomains.length}</div>
        <div class="pricing-domains">
    `;
    
    // Add list of selected domains with their durations
    selectedDomains.forEach(domain => {
      orderHTML += `
        <div class="domain-item">
          <div class="domain-info">
            <span>${domain.name}</span>
            <span class="domain-duration">${domain.duration} ${domain.duration === 1 ? 'aasta' : 'aastat'} - ${getDomainPrice(domain.duration)} €</span>
          </div>
          <span class="remove-domain" data-domain="${domain.name}">✕</span>
        </div>
      `;
    });
    
    orderHTML += `
        </div>
        <div class="pricing-label">Hind kokku: ${totalPrice} €</div>
      </div>
    `;
    
    pricingColumn.innerHTML = orderHTML;
    
    // Add handlers for removing domains from the list
    document.querySelectorAll('.remove-domain').forEach(btn => {
      btn.addEventListener('click', function() {
        const domainToRemove = this.getAttribute('data-domain');
        selectedDomains = selectedDomains.filter(domain => domain.name !== domainToRemove);
        updateOrderSummary();
        saveSelectedDomains();
      });
    });
  }
  
  // Function to save selected domains with their durations in localStorage
  function saveSelectedDomains() {
    localStorage.setItem('selectedDomains', JSON.stringify(selectedDomains));
  }
  
  // Function to load selected domains with their durations from localStorage
  function loadSelectedDomains() {
    const saved = localStorage.getItem('selectedDomains');
    if (saved) {
      selectedDomains = JSON.parse(saved);
      updateOrderSummary();
    }
  }
  
  // Load saved domains on initialization
  loadSelectedDomains();
  
  // Handler for the search button
  searchButton?.addEventListener("click", () => {
    const domainInputValue = document.querySelector('.domain-input').value.trim();
    const selectedExtension = document.getElementById("extensionSelect").value;
    
    resultDiv.innerHTML = "";
    resultDiv.style.color = "black";
    
    if (!domainInputValue) {
      resultDiv.innerHTML = "<p style='color: red;'>Palun sisesta domeeninimi!!</p>";
      return;
    }
    
    let domains = [];
    const extensions = [".com", ".net", ".org", ".ee"];
    
    if (selectedExtension !== "Kõik") {
      domains.push({ name: domainInputValue + selectedExtension });
    } else {
      domains = extensions.map(ext => ({
        name: domainInputValue + ext
      }));
    }
    
    domains.forEach(domain => {
      const domainItem = document.createElement("div");
      domainItem.classList.add("domain-result");
      
      // Domain name
      const domainName = document.createElement("span");
      domainName.textContent = domain.name;
      domainName.classList.add("domain-name");
      
      // Duration selector
      const durationSelector = document.createElement("select");
      durationSelector.classList.add("duration-selector");
      
      const durations = [
        { value: 1, text: "1 aasta - 8 €" },
        { value: 2, text: "2 aastat - 14 €" },
        { value: 3, text: "3 aastat - 20 €" },
        { value: 5, text: "5 aastat - 32 €" }
      ];
      
      durations.forEach(duration => {
        const option = document.createElement("option");
        option.value = duration.value;
        option.textContent = duration.text;
        durationSelector.appendChild(option);
      });
      
      // Price container
      const priceContainer = document.createElement("div");
      priceContainer.classList.add("price-container");
      priceContainer.appendChild(durationSelector);
      
      // Add button
      const addButton = document.createElement("button");
      addButton.textContent = "lisa";
      addButton.classList.add("add-button");
      
      // Check if the domain is already selected
      const existingDomain = selectedDomains.find(d => d.name === domain.name);
      if (existingDomain) {
        addButton.textContent = "valitud";
        addButton.classList.add("selected");
        durationSelector.value = existingDomain.duration;
      }
      
      addButton.addEventListener("click", () => {
        // Toggle selection state
        const existingIndex = selectedDomains.findIndex(d => d.name === domain.name);
        
        if (existingIndex !== -1) {
          // If domain is already selected, remove it
          selectedDomains.splice(existingIndex, 1);
          addButton.textContent = "lisa";
          addButton.classList.remove("selected");
        } else {
          // If domain is not selected, add it with the selected duration
          selectedDomains.push({
            name: domain.name,
            duration: parseInt(durationSelector.value)
          });
          addButton.textContent = "valitud";
          addButton.classList.add("selected");
        }
        
        // Update order block
        updateOrderSummary();
        saveSelectedDomains();
        
        // Show the Edasi button if domains are selected
        const edasiContainer = document.querySelector('.button-container');
        if (edasiContainer) {
          edasiContainer.style.display = selectedDomains.length > 0 ? 'block' : 'none';
        }
      });
      
      // Update button state when duration changes
      durationSelector.addEventListener("change", () => {
        const existingIndex = selectedDomains.findIndex(d => d.name === domain.name);
        if (existingIndex !== -1) {
          // Update duration for already selected domain
          selectedDomains[existingIndex].duration = parseInt(durationSelector.value);
          updateOrderSummary();
          saveSelectedDomains();
        }
      });
      
      domainItem.appendChild(domainName);
      domainItem.appendChild(priceContainer);
      domainItem.appendChild(addButton);
      resultDiv.appendChild(domainItem);
    });
    
    // Show the Edasi button if domains are selected
    const edasiContainer = document.querySelector('.button-container');
    if (edasiContainer) {
      edasiContainer.style.display = selectedDomains.length > 0 ? 'block' : 'none';
    }
  });
  
  // Handler for the "Edasi" button on otsi.html page
  const edasiButtonOtsi = document.querySelector('.button1');
  edasiButtonOtsi?.addEventListener("click", (e) => {
    // Check if at least one domain is selected
    if (selectedDomains.length === 0) {
      e.preventDefault();
      alert("Palun valige vähemalt üks domeen!");
      return;
    }
    
    // Save selected domains before transitioning
    saveSelectedDomains();
  });
  
  // Handler for the "Edasi" button on andmed.html page
  edasiButton?.addEventListener("click", () => {
    // Check if required fields are filled before proceeding
    const nameInput = document.querySelector('input[placeholder="Text"]');
    const emailInput = document.querySelector('input[type="email"]');
    
    if (!nameInput?.value || !emailInput?.value) {
      alert("Palun täitke kohustuslikud väljad!");
      return;
    }
    
    // Navigate to maksa.html page
    window.location.href = "maksa.html";
  });
  
  // Handler for the "Tagasi" button on andmed.html page
  tagasiButton?.addEventListener("click", () => {
    // Navigate back to otsi.html page
    window.location.href = "otsi.html";
  });
  
  // If we're on andmed.html page, display selected domains
  if (window.location.href.includes("andmed.html")) {
    const savedDomains = localStorage.getItem('selectedDomains');
    
    if (savedDomains) {
      selectedDomains = JSON.parse(savedDomains);
    }
    
    updateOrderSummary();
  }
  
  // If we're on the thank you page, display the customer's email
  if (window.location.href.includes("maksa.html")) {
    const emailElement = document.querySelector('.email-text');
    if (emailElement) {
      // Try to get customer email from localStorage or use placeholder
      const customerEmail = localStorage.getItem('customerEmail') || '[kliendi email]';
      emailElement.textContent = `Saadame arve teie e-posti aadressile ${customerEmail}.`;
    }
  }
});