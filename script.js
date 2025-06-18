// ======= VARIABILI GLOBALI =======
let currentCategory = null;
let currentSubcategory = null;
let currentPrompt = null;

// ======= AVVIO =======
document.addEventListener("DOMContentLoaded", () => {
    renderCategories();
    setupSearch();
});

// ======= STRUTTURA DATI =======
const promptsStructure = {
  "medicina": {
    title: "Medicina & Diagnosi AI",
    icon: "🏥",
    subcategories: {
      "diagnosi-sintomi": "Diagnosi da Sintomi",
      "approfondimenti": "Approfondimenti su Patologie",
      "neurologia": "Neurologia",
      "terapie": "Terapie & Linee Guida",
      "referti": "Referti & Riscrittura",
      "geriatria": "Geriatria",
      "neuropsicologia": "Psicologia & Neuropsicologia",
      "laboratorio": "Laboratorio Analisi",
      "fisiopatologia-respiratoria": "Fisiopatologia Respiratoria",
      "radiologia": "Radiologia",
      "dietologia": "Dietologia",
      "farmacia": "Farmacia",
      "medicina-generale": "Medicina Generale",
      "pneumologia": "Pneumologia",
      "cardiologia": "Cardiologia"
    }
},



  "scrittura-comunicazione": {
    title: "Comunicazione",
    icon: "✍️",
    subcategories: {
      "email-professionali": "Email Professionali",
      "documenti-aziendali": "Documenti Aziendali",
      "content-marketing": "Content Marketing",
      "copywriting": "Copywriting",
      "editing-proofreading": "Editing & Proofreading"
    }
  },

  "ricerca-analisi": {
    title: "Ricerca & Analisi",
    icon: "🔍",
    subcategories: {
      "ricerca-web": "Ricerca Web",
      "analisi-dati": "Analisi Dati",
      "competitor-analysis": "Competitor Analysis",
      "swot-analysis": "SWOT Analysis",
      "ricerca-accademica": "Ricerca Accademica"
    }
  },

  "programmazione": {
    title: "Programmazione",
    icon: "💻",
    subcategories: {
      "python": "Python",
      "web-development": "Web Development",
      "powershell": "PowerShell",
      "database": "Database",
      "devops": "DevOps",
      "vibe-coding": "Vibe Coding"
    }
  },

  "creativita-design": {
    title: "Creatività & Design",
    icon: "🎨",
    subcategories: {
      "generazione-immagini": "Generazione Immagini",
      "generazione-video": "Generazione Video",
      "brainstorming": "Brainstorming",
      "storytelling": "Storytelling",
      "design-thinking": "Design Thinking",
      "branding": "Branding"
    }
  }

  // Puoi aggiungere qui altre categorie future (es. business, legal, HR...)
};



// ======= RENDER CATEGORIE =======
function renderCategories() {
    const container = document.getElementById("categoriesContainer");
    container.innerHTML = "";

    Object.entries(promptsStructure).forEach(([catKey, catData]) => {
        const categoryDiv = document.createElement("div");
        categoryDiv.className = "category";

        const titleDiv = document.createElement("div");
        titleDiv.className = "category-title";
        titleDiv.innerHTML = `${catData.icon} ${catData.title} <span>▼</span>`;
        titleDiv.onclick = () => toggleCategory(catKey);

        const subDiv = document.createElement("div");
        subDiv.className = "subcategories";
        subDiv.id = `subcategories-${catKey}`;

        Object.entries(catData.subcategories).forEach(([subKey, subTitle]) => {
            const subItem = document.createElement("div");
            subItem.className = "subcategory";
            subItem.textContent = subTitle;
            subItem.onclick = () => loadPromptsHTML(catKey, subKey, subTitle);
            subDiv.appendChild(subItem);
        });

        categoryDiv.appendChild(titleDiv);
        categoryDiv.appendChild(subDiv);
        container.appendChild(categoryDiv);
    });
}

// ======= ESPANDI/COLLASA CATEGORIA =======
function toggleCategory(catKey) {
    const subDiv = document.getElementById(`subcategories-${catKey}`);
    const titleDiv = subDiv.previousElementSibling;
    subDiv.classList.toggle("active");
    titleDiv.classList.toggle("active");
    const arrow = titleDiv.querySelector("span");
    arrow.textContent = subDiv.classList.contains("active") ? "▲" : "▼";
}

// ======= CARICA PROMPT DA FILE HTML =======
function loadPromptsHTML(catKey, subKey, subTitle) {
    currentCategory = catKey;
    currentSubcategory = subKey;

    const breadcrumb = document.getElementById("breadcrumb");
    breadcrumb.innerHTML = `
        <a href="#" onclick="showAllPrompts()">Home</a> > 
        <a href="#" onclick="toggleCategory('${catKey}')">${promptsStructure[catKey].title}</a> > 
        ${subTitle}
    `;

    document.querySelectorAll('.subcategory').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');

    fetch(`categories/${subKey}.html`)
        .then(res => res.text())
        .then(html => {
            const container = document.getElementById("promptsContainer");
            container.innerHTML = html;

            // ASSOCIA GLI EVENTI DINAMICAMENTE AI BOTTONI
            document.querySelectorAll(".use-prompt-btn").forEach(button => {
                button.addEventListener("click", () => {
                    const promptData = JSON.parse(button.dataset.prompt);
                    openPromptModal(promptData.title, promptData.template, promptData.variables);
                });
            });
        })
        .catch(err => {
            document.getElementById("promptsContainer").innerHTML = `<p style="color:red">Errore nel caricamento: ${err}</p>`;
        });
}


// ======= MODAL =======
function openPromptModal(title, template, variables = []) {
    currentPrompt = { title, template, variables };

    document.getElementById("modalTitle").textContent = title;
    document.getElementById("promptEditor").value = template;

    const panel = document.getElementById("variablesPanel");
    panel.innerHTML = '<h4>🔧 Personalizza le Variabili</h4>';

    variables.forEach(v => {
        const div = document.createElement("div");
        div.className = "variable-input";
        div.innerHTML = `<label>${v.label}:</label>`;
        if (v.type === "select") {
            div.innerHTML += `<select id="var-${v.name}">${v.options.map(opt => `<option>${opt}</option>`).join('')}</select>`;
        } else if (v.type === "textarea") {
            div.innerHTML += `<textarea id="var-${v.name}"></textarea>`;
        } else {
            div.innerHTML += `<input type="text" id="var-${v.name}" />`;
        }
        panel.appendChild(div);
    });

    document.getElementById("promptModal").classList.add("active");
}

function closeModal() {
    document.getElementById("promptModal").classList.remove("active");
}

function updatePrompt() {
    if (!currentPrompt) return;
    let updated = currentPrompt.template;
    currentPrompt.variables.forEach(v => {
        const input = document.getElementById(`var-${v.name}`);
        const val = input?.value || '';
        const regex = new RegExp(`\\[${v.name}\\]`, 'g');
        updated = updated.replace(regex, val);
    });
    document.getElementById("promptEditor").value = updated;
}

function copyPrompt() {
    const text = document.getElementById("promptEditor").value;
    navigator.clipboard.writeText(text).then(() => {
        showCopyNotification();
        closeModal();
    });
}

function showCopyNotification() {
    const notif = document.getElementById("copyNotification");
    notif.classList.add("show");
    setTimeout(() => notif.classList.remove("show"), 3000);
}

// ======= RICERCA (bozza, miglioreremo dopo) =======
function setupSearch() {
    const box = document.getElementById("searchBox");
    box.addEventListener("input", () => {
        if (box.value.length === 0) showAllPrompts();
        // TODO: ricerca testuale estesa
    });
}

function showAllPrompts() {
    document.getElementById("breadcrumb").innerHTML = `<a href="#">Home</a>`;
    document.getElementById("promptsContainer").innerHTML = `
        <div style="text-align:center; padding:50px;">
            <h2>👋 Benvenuto nella tua Prompt Library!</h2>
            <p>Seleziona una categoria dalla sidebar per iniziare</p>
        </div>`;
}

// Modal guida
const guidaBtn = document.getElementById("guidaBtn");
const guidaModal = document.getElementById("guidaModal");
const chiudiGuida = document.getElementById("chiudiGuida");

guidaBtn.addEventListener("click", () => {
  guidaModal.style.display = "block";
});

chiudiGuida.addEventListener("click", () => {
  guidaModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === guidaModal) {
    guidaModal.style.display = "none";
  }
});
