// Stockage local des chercheurs
let chercheurs = JSON.parse(localStorage.getItem('chercheurs')) || [];

// Prévisualisation de la photo
document.getElementById('photo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('photoPreview');
            img.src = e.target.result;
            img.classList.remove('image-loaded');
            setTimeout(() => {
                img.classList.add('image-loaded');
                document.querySelector('.photo-upload-container').classList.add('has-image');
            }, 50);
        };
        reader.readAsDataURL(file);
    }
});

// Fonction pour afficher les chercheurs
function afficherChercheurs(chercheursToDisplay = chercheurs) {
    const tbody = document.getElementById('chercheurTableBody');
    tbody.innerHTML = '';

    if (chercheursToDisplay.length === 0) {
        // Afficher un message si aucun résultat
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-search mb-2" style="font-size: 2rem;"></i>
                    <p class="mb-0">Aucun chercheur ne correspond à vos critères de recherche</p>
                </td>
            </tr>
        `;
        return;
    }

    chercheursToDisplay.forEach(chercheur => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.innerHTML = `
            <td>
                <img src="${chercheur.photo}" alt="Photo ${chercheur.nomPrenom}" title="${chercheur.nomPrenom}">
            </td>
            <td class="fw-medium">${chercheur.nomPrenom}</td>
            <td>${chercheur.profession || '<span class="text-secondary">Non spécifié</span>'}</td>
            <td>${chercheur.axeRecherche || '<span class="text-secondary">Non spécifié</span>'}</td>
            <td class="actions-column text-end">
                <div class="btn-group">
                    <button class="btn btn-primary btn-sm" onclick="modifierChercheur(${chercheur.id})" title="Modifier">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-info btn-sm" onclick="imprimerChercheur(${chercheur.id})" title="Imprimer">
                        <i class="bi bi-printer"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="supprimerChercheur(${chercheur.id})" title="Supprimer">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;

        // Ajouter l'événement pour ouvrir la modal de détails
        tr.addEventListener('click', (e) => {
            // Ne pas ouvrir la modal si on clique sur un bouton d'action
            if (!e.target.closest('.btn-group')) {
                afficherDetails(chercheur);
            }
        });

        tbody.appendChild(tr);
    });
}

// Fonction pour modifier un chercheur
function modifierChercheur(id) {
    const chercheur = chercheurs.find(c => c.id === id);
    if (!chercheur) return;

    // Remplir le formulaire avec les données du chercheur
    document.getElementById('photoPreview').src = chercheur.photo;
    document.getElementById('nomPrenom').value = chercheur.nomPrenom;
    document.getElementById('nationalite').value = chercheur.nationalite;
    document.getElementById('profession').value = chercheur.profession || '';
    document.getElementById('axeRecherche').value = chercheur.axeRecherche || '';
    document.getElementById('specialite').value = chercheur.specialite || '';
    document.getElementById('hIndex').value = chercheur.hIndex || '';
    document.getElementById('email').value = chercheur.email;
    document.getElementById('telephone').value = chercheur.telephone || '';
    document.getElementById('researchgate').value = stripUrlPrefix(chercheur.researchgate);
    document.getElementById('googleScholar').value = stripUrlPrefix(chercheur.googleScholar);
    document.getElementById('scopus').value = stripUrlPrefix(chercheur.scopus);

    // Modifier le comportement du formulaire pour la mise à jour
    const form = document.getElementById('chercheurForm');
    form.dataset.mode = 'edit';
    form.dataset.editId = id;

    // Ouvrir la modal
    const modal = new bootstrap.Modal(document.getElementById('formModal'));
    modal.show();
}

// Fonction pour imprimer les détails d'un chercheur
function imprimerChercheur(id) {
    const chercheur = chercheurs.find(c => c.id === id);
    if (!chercheur) return;

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Profil du chercheur - ${chercheur.nomPrenom}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                    line-height: 1.4;
                    color: #2d3748;
                    margin: 0;
                    padding: 20px;
                    font-size: 11pt;
                }

                .print-container {
                    max-width: 100%;
                    margin: 0 auto;
                }

                .print-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #e2e8f0;
                }

                .photo-container {
                    flex: 0 0 120px;
                    margin-right: 20px;
                }

                .header-info {
                    flex: 1;
                }

                .photo {
                    width: 120px;
                    height: 120px;
                    object-fit: contain;
                    border-radius: 8px;
                    border: 2px solid #e2e8f0;
                    padding: 3px;
                }

                .researcher-name {
                    font-size: 20pt;
                    font-weight: 600;
                    color: #1a365d;
                    margin: 0 0 5px;
                }

                .profession {
                    font-size: 12pt;
                    color: #4a5568;
                    margin-bottom: 5px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .info-section {
                    background: #f8fafc;
                    border-radius: 6px;
                    padding: 12px;
                }

                .info-section h3 {
                    font-size: 12pt;
                    font-weight: 600;
                    color: #4a5568;
                    margin: 0 0 8px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .info-item {
                    margin-bottom: 8px;
                }

                .info-label {
                    font-weight: 500;
                    color: #718096;
                    font-size: 10pt;
                    margin-bottom: 2px;
                }

                .info-value {
                    color: #2d3748;
                    font-size: 11pt;
                }

                .social-links {
                    background: #f8fafc;
                    border-radius: 6px;
                    padding: 12px;
                    margin-top: 15px;
                }

                .social-links h3 {
                    font-size: 12pt;
                    font-weight: 600;
                    color: #4a5568;
                    margin: 0 0 8px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .social-link {
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
                    color: #4a5568;
                    text-decoration: none;
                    font-size: 10pt;
                }

                .social-link i {
                    width: 16px;
                    height: 16px;
                    margin-right: 8px;
                    color: #4a5568;
                }

                .footer {
                    margin-top: 15px;
                    text-align: right;
                    color: #718096;
                    font-size: 9pt;
                }

                @media print {
                    @page {
                        margin: 1.5cm;
                        size: A4;
                    }

                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .print-container {
                        page-break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-container">
                <div class="print-header">
                    <div class="photo-container">
                        <img src="${chercheur.photo}" alt="Photo" class="photo">
                    </div>
                    <div class="header-info">
                        <h1 class="researcher-name">${chercheur.nomPrenom}</h1>
                        <div class="profession">${chercheur.profession || 'Non spécifié'}</div>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-section">
                        <h3>Informations personnelles</h3>
                        <div class="info-item">
                            <div class="info-label">Nationalité</div>
                            <div class="info-value">${chercheur.nationalite || 'Non spécifié'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Email</div>
                            <div class="info-value">${chercheur.email}</div>
                        </div>
                        ${chercheur.telephone ? `
                        <div class="info-item">
                            <div class="info-label">Téléphone</div>
                            <div class="info-value">${chercheur.telephone}</div>
                        </div>
                        ` : ''}
                        ${chercheur.hIndex ? `
                        <div class="info-item">
                            <div class="info-label">H-index</div>
                            <div class="info-value">${chercheur.hIndex}</div>
                        </div>
                        ` : ''}
                    </div>

                    <div class="info-section">
                        <h3>Domaine de recherche</h3>
                        <div class="info-item">
                            <div class="info-label">Axe de recherche</div>
                            <div class="info-value">${chercheur.axeRecherche || 'Non spécifié'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Spécialité</div>
                            <div class="info-value">${chercheur.specialite || 'Non spécifié'}</div>
                        </div>
                    </div>
                </div>

                ${(chercheur.researchgate || chercheur.googleScholar || chercheur.scopus) ? `
                <div class="social-links">
                    <h3>Profils professionnels</h3>
                    ${chercheur.researchgate ? `
                    <div class="social-link">
                        <a href="${chercheur.researchgate}" target="_blank">
                            <i class="bi bi-globe"></i>
                            ResearchGate
                        </a>
                    </div>
                    ` : ''}
                    ${chercheur.googleScholar ? `
                    <div class="social-link">
                        <a href="${chercheur.googleScholar}" target="_blank">
                            <i class="bi bi-google"></i>
                            Google Scholar
                        </a>
                    </div>
                    ` : ''}
                    ${chercheur.scopus ? `
                    <div class="social-link">
                        <a href="${chercheur.scopus}" target="_blank">
                            <i class="bi bi-journal-text"></i>
                            Scopus
                        </a>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                <div class="footer">
                    Document généré le ${new Date().toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    // Attendre que les ressources soient chargées avant d'imprimer
    printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
    };
}

// Fonction pour afficher les détails dans la modal
function afficherDetails(chercheur) {
    // Mettre à jour les informations dans la modal
    document.getElementById('detailsPhoto').src = chercheur.photo;
    document.getElementById('detailsNomPrenom').textContent = chercheur.nomPrenom;
    document.getElementById('detailsNationalite').textContent = chercheur.nationalite || 'Non spécifié';
    document.getElementById('detailsProfession').textContent = chercheur.profession || 'Non spécifié';
    document.getElementById('detailsAxeRecherche').textContent = chercheur.axeRecherche || 'Non spécifié';
    document.getElementById('detailsSpecialite').textContent = chercheur.specialite || 'Non spécifié';
    
    // Ajouter l'affichage du H-index s'il existe
    const hIndexElement = document.getElementById('detailsHIndex');
    if (hIndexElement) {
        if (chercheur.hIndex !== null && chercheur.hIndex !== undefined) {
            hIndexElement.textContent = chercheur.hIndex;
            hIndexElement.parentElement.style.display = 'block';
        } else {
            hIndexElement.parentElement.style.display = 'none';
        }
    }

    document.getElementById('detailsEmail').textContent = chercheur.email;

    // Gérer l'affichage du téléphone
    const telContainer = document.getElementById('detailsTelephoneContainer');
    if (chercheur.telephone) {
        telContainer.style.display = 'block';
        document.getElementById('detailsTelephone').textContent = chercheur.telephone;
    } else {
        telContainer.style.display = 'none';
    }

    // Gérer les liens sociaux
    const socialLinksContainer = document.getElementById('detailsSocialLinks');
    socialLinksContainer.innerHTML = '';
    
    if (chercheur.researchgate || chercheur.googleScholar || chercheur.scopus) {
        const links = [];
        
        // ResearchGate
        if (chercheur.researchgate) {
            links.push(`
                <div class="social-link-item mb-2">
                    <a href="${chercheur.researchgate}" target="_blank" class="btn btn-outline-primary w-100 text-start">
                        <i class="bi bi-globe me-2"></i>
                        <span class="link-text">ResearchGate</span>
                        <small class="ms-2 text-muted">${chercheur.researchgate}</small>
                    </a>
                </div>
            `);
        }
        
        // Google Scholar
        if (chercheur.googleScholar) {
            links.push(`
                <div class="social-link-item mb-2">
                    <a href="${chercheur.googleScholar}" target="_blank" class="btn btn-outline-primary w-100 text-start">
                        <i class="bi bi-google me-2"></i>
                        <span class="link-text">Google Scholar</span>
                        <small class="ms-2 text-muted">${chercheur.googleScholar}</small>
                    </a>
                </div>
            `);
        }
        
        // Scopus
        if (chercheur.scopus) {
            links.push(`
                <div class="social-link-item mb-2">
                    <a href="${chercheur.scopus}" target="_blank" class="btn btn-outline-primary w-100 text-start">
                        <i class="bi bi-journal-text me-2"></i>
                        <span class="link-text">Scopus</span>
                        <small class="ms-2 text-muted">${chercheur.scopus}</small>
                    </a>
                </div>
            `);
        }
        
        socialLinksContainer.innerHTML = links.join('');
    } else {
        socialLinksContainer.innerHTML = '<span class="text-secondary">Aucun profil renseigné</span>';
    }

    // Ouvrir la modal
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
}

// Fonction pour mettre à jour les options des sélecteurs de recherche
function updateSearchOptions() {
    const specialites = new Set();
    const axes = new Set();
    
    chercheurs.forEach(chercheur => {
        if (chercheur.specialite) specialites.add(chercheur.specialite);
        if (chercheur.axeRecherche) axes.add(chercheur.axeRecherche);
    });

    const specialiteSelect = document.getElementById('searchSpecialite');
    const axeSelect = document.getElementById('searchAxe');

    // Vider les options existantes sauf la première
    specialiteSelect.innerHTML = '<option value="">Spécialité</option>';
    axeSelect.innerHTML = '<option value="">Axe de recherche</option>';

    // Ajouter les nouvelles options
    [...specialites].sort().forEach(specialite => {
        specialiteSelect.add(new Option(specialite, specialite));
    });

    [...axes].sort().forEach(axe => {
        axeSelect.add(new Option(axe, axe));
    });
}

// Fonction de recherche
function filterChercheurs() {
    const searchNom = document.getElementById('searchNom').value.toLowerCase();
    const searchProfession = document.getElementById('searchProfession').value;
    const searchAxe = document.getElementById('searchAxe').value;
    const searchHIndex = document.getElementById('searchHIndex').value;
    const searchProfils = document.getElementById('searchProfils').value;
    const searchNationalite = document.getElementById('searchNationalite').value.toLowerCase();

    const filteredChercheurs = chercheurs.filter(chercheur => {
        // Filtre par nom/prénom
        if (searchNom && !chercheur.nomPrenom.toLowerCase().includes(searchNom)) {
            return false;
        }

        // Filtre par profession
        if (searchProfession && chercheur.profession !== searchProfession) {
            return false;
        }

        // Filtre par axe de recherche
        if (searchAxe && chercheur.axeRecherche !== searchAxe) {
            return false;
        }

        // Filtre par H-index
        if (searchHIndex && (!chercheur.hIndex || chercheur.hIndex < parseInt(searchHIndex))) {
            return false;
        }

        // Filtre par nationalité
        if (searchNationalite && !chercheur.nationalite.toLowerCase().includes(searchNationalite)) {
            return false;
        }

        // Filtre par profil académique
        if (searchProfils) {
            switch(searchProfils) {
                case 'researchgate':
                    if (!chercheur.researchgate) return false;
                    break;
                case 'googleScholar':
                    if (!chercheur.googleScholar) return false;
                    break;
                case 'scopus':
                    if (!chercheur.scopus) return false;
                    break;
            }
        }

        return true;
    });

    afficherChercheurs(filteredChercheurs);
}

// Événements pour la recherche
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter les écouteurs d'événements pour la recherche
    const searchInputs = [
        'searchNom',
        'searchProfession',
        'searchAxe',
        'searchHIndex',
        'searchProfils',
        'searchNationalite'
    ];

    searchInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', filterChercheurs);
            element.addEventListener('change', filterChercheurs);
        }
    });

    // Bouton de réinitialisation
    document.getElementById('resetSearch').addEventListener('click', function() {
        // Réinitialiser tous les champs de recherche
        searchInputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                element.value = '';
            }
        });
        // Réafficher tous les chercheurs
        afficherChercheurs(chercheurs);
    });
});

// Fonction pour formater l'URL
function formatUrl(input) {
    if (!input) return '';
    input = input.trim();
    if (input === '') return '';
    return 'https://' + input.replace(/^https?:\/\//i, '');
}

// Fonction pour extraire l'URL sans le préfixe https://
function stripUrlPrefix(url) {
    if (!url) return '';
    return url.replace(/^https?:\/\//i, '');
}

// Initialisation des tooltips Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser tous les tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Gestion du formulaire
document.getElementById('chercheurForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const professionSelect = document.getElementById('profession');
    const autreProfessionContainer = document.getElementById('autreProfessionContainer');
    const autreProfessionInput = document.getElementById('autreProfession');

    let professionValue = professionSelect.value;
    if (professionValue === 'Autre' && autreProfessionInput.value.trim()) {
        professionValue = autreProfessionInput.value.trim();
    }

    const chercheur = {
        photo: document.getElementById('photoPreview').src,
        nomPrenom: document.getElementById('nomPrenom').value.trim(),
        nationalite: document.getElementById('nationalite').value.trim(),
        profession: professionValue,
        axeRecherche: document.getElementById('axeRecherche').value.trim(),
        specialite: document.getElementById('specialite').value.trim(),
        hIndex: document.getElementById('hIndex').value ? parseInt(document.getElementById('hIndex').value) : null,
        email: document.getElementById('email').value.trim(),
        telephone: document.getElementById('telephone').value.trim(),
        researchgate: formatUrl(document.getElementById('researchgate').value),
        googleScholar: formatUrl(document.getElementById('googleScholar').value),
        scopus: formatUrl(document.getElementById('scopus').value)
    };

    if (this.dataset.mode === 'edit') {
        // Mode modification
        const id = parseInt(this.dataset.editId);
        chercheur.id = id;
        const index = chercheurs.findIndex(c => c.id === id);
        if (index !== -1) {
            chercheurs[index] = chercheur;
        }
        this.dataset.mode = 'add';
        delete this.dataset.editId;
    } else {
        // Mode ajout
        chercheur.id = Date.now();
        chercheurs.push(chercheur);
    }
    
    // Sauvegarde et mise à jour de l'affichage
    localStorage.setItem('chercheurs', JSON.stringify(chercheurs));
    afficherChercheurs();

    // Fermer la modal et réinitialiser le formulaire
    const modal = bootstrap.Modal.getInstance(document.getElementById('formModal'));
    modal.hide();
    this.reset();
    document.getElementById('photoPreview').src = 'placeholder.png';
    document.querySelector('.photo-upload-container').classList.remove('has-image');

    // Message de confirmation
    alert(this.dataset.mode === 'edit' ? 'Chercheur modifié avec succès !' : 'Chercheur ajouté avec succès !');
});

// Gestion du champ "Autre profession"
document.addEventListener('DOMContentLoaded', function() {
    const professionSelect = document.getElementById('profession');
    const autreProfessionContainer = document.getElementById('autreProfessionContainer');
    const autreProfessionInput = document.getElementById('autreProfession');

    professionSelect.addEventListener('change', function() {
        if (this.value === 'Autre') {
            autreProfessionContainer.style.display = 'block';
            autreProfessionInput.required = true;
        } else {
            autreProfessionContainer.style.display = 'none';
            autreProfessionInput.required = false;
            autreProfessionInput.value = '';
        }
    });

    // Gestion du champ "Autre axe de recherche"
    const axeSelect = document.getElementById('axeRecherche');
    const autreAxeContainer = document.getElementById('autreAxeContainer');
    const autreAxeInput = document.getElementById('autreAxe');

    axeSelect.addEventListener('change', function() {
        if (this.value === 'Autre') {
            autreAxeContainer.style.display = 'block';
            autreAxeInput.required = true;
        } else {
            autreAxeContainer.style.display = 'none';
            autreAxeInput.required = false;
            autreAxeInput.value = '';
        }
    });

    // Modification de la fonction de sauvegarde pour gérer les champs personnalisés
    const form = document.getElementById('chercheurForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupération de la profession (standard ou personnalisée)
        let professionValue = professionSelect.value;
        if (professionValue === 'Autre' && autreProfessionInput.value.trim()) {
            professionValue = autreProfessionInput.value.trim();
        }

        // Récupération de l'axe de recherche (standard ou personnalisé)
        let axeValue = axeSelect.value;
        if (axeValue === 'Autre' && autreAxeInput.value.trim()) {
            axeValue = autreAxeInput.value.trim();
        }

        const chercheur = {
            photo: photoPreview.src,
            nomPrenom: document.getElementById('nomPrenom').value,
            nationalite: document.getElementById('nationalite').value,
            profession: professionValue,
            axeRecherche: axeValue,
            specialite: document.getElementById('specialite').value,
            hIndex: document.getElementById('hIndex').value,
            email: document.getElementById('email').value,
            telephone: document.getElementById('telephone').value,
            researchgate: formatUrl(document.getElementById('researchgate').value),
            googleScholar: formatUrl(document.getElementById('googleScholar').value),
            scopus: formatUrl(document.getElementById('scopus').value)
        };

        // Ajout du chercheur
        chercheurs.push(chercheur);
        
        // Sauvegarde dans le localStorage
        localStorage.setItem('chercheurs', JSON.stringify(chercheurs));
        
        // Mise à jour de l'affichage
        afficherChercheurs();
        
        // Fermeture du modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('formModal'));
        modal.hide();
        
        // Réinitialisation du formulaire
        form.reset();
        photoPreview.src = 'placeholder.png';
        autreProfessionContainer.style.display = 'none';
        autreAxeContainer.style.display = 'none';
    });
});

// Mise à jour de la fonction de modification pour gérer les champs personnalisés
function modifierChercheur(chercheur) {
    const modal = new bootstrap.Modal(document.getElementById('formModal'));
    
    // Remplissage des champs du formulaire
    document.getElementById('photoPreview').src = chercheur.photo;
    document.getElementById('nomPrenom').value = chercheur.nomPrenom;
    document.getElementById('nationalite').value = chercheur.nationalite;
    
    // Gestion de la profession
    const professionSelect = document.getElementById('profession');
    const autreProfessionContainer = document.getElementById('autreProfessionContainer');
    const autreProfessionInput = document.getElementById('autreProfession');
    
    if (professionSelect.querySelector(`option[value="${chercheur.profession}"]`)) {
        professionSelect.value = chercheur.profession;
        autreProfessionContainer.style.display = 'none';
    } else {
        professionSelect.value = 'Autre';
        autreProfessionInput.value = chercheur.profession;
        autreProfessionContainer.style.display = 'block';
    }

    // Gestion de l'axe de recherche
    const axeSelect = document.getElementById('axeRecherche');
    const autreAxeContainer = document.getElementById('autreAxeContainer');
    const autreAxeInput = document.getElementById('autreAxe');
    
    if (axeSelect.querySelector(`option[value="${chercheur.axeRecherche}"]`)) {
        axeSelect.value = chercheur.axeRecherche;
        autreAxeContainer.style.display = 'none';
    } else {
        axeSelect.value = 'Autre';
        autreAxeInput.value = chercheur.axeRecherche;
        autreAxeContainer.style.display = 'block';
    }

    // Remplissage des autres champs
    document.getElementById('specialite').value = chercheur.specialite || '';
    document.getElementById('hIndex').value = chercheur.hIndex || '';
    document.getElementById('email').value = chercheur.email;
    document.getElementById('telephone').value = chercheur.telephone || '';
    document.getElementById('researchgate').value = chercheur.researchgate ? chercheur.researchgate.replace('https://', '') : '';
    document.getElementById('googleScholar').value = chercheur.googleScholar ? chercheur.googleScholar.replace('https://', '') : '';
    document.getElementById('scopus').value = chercheur.scopus ? chercheur.scopus.replace('https://', '') : '';

    modal.show();
}

// Fonction pour supprimer un chercheur
function supprimerChercheur(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce chercheur ?')) {
        chercheurs = chercheurs.filter(c => c.id !== id);
        localStorage.setItem('chercheurs', JSON.stringify(chercheurs));
        afficherChercheurs();
    }
}

// Affichage initial des chercheurs
afficherChercheurs();

// Fonction pour l'autocomplétion
class Autocomplete {
    constructor(input, suggestionsContainer) {
        this.input = input;
        this.suggestionsContainer = suggestionsContainer;
        this.currentFocus = -1;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Événement de saisie
        this.input.addEventListener('input', () => {
            this.searchAndShowSuggestions();
        });

        // Navigation au clavier
        this.input.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });

        // Clic en dehors
        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
                this.closeSuggestions();
            }
        });
    }

    searchAndShowSuggestions() {
        const searchTerm = this.input.value.toLowerCase();
        if (!searchTerm) {
            this.closeSuggestions();
            afficherChercheurs(chercheurs);
            return;
        }

        const suggestions = this.searchChercheurs(searchTerm);
        this.showSuggestions(suggestions, searchTerm);
        
        // Filtrer le tableau principal
        afficherChercheurs(suggestions);
    }

    searchChercheurs(searchTerm) {
        return chercheurs.filter(chercheur => {
            const searchableFields = [
                chercheur.nomPrenom,
                chercheur.specialite,
                chercheur.axeRecherche,
                chercheur.profession,
                chercheur.nationalite,
                chercheur.email
            ].filter(Boolean); // Enlever les valeurs null/undefined

            return searchableFields.some(field => 
                field.toLowerCase().includes(searchTerm)
            );
        });
    }

    showSuggestions(suggestions, searchTerm) {
        this.suggestionsContainer.innerHTML = '';
        
        if (suggestions.length === 0) {
            this.suggestionsContainer.innerHTML = `
                <div class="no-suggestions">
                    <i class="bi bi-search mb-2"></i>
                    <p>Aucun résultat trouvé</p>
                </div>
            `;
            this.suggestionsContainer.classList.add('show');
            return;
        }

        suggestions.slice(0, 5).forEach(chercheur => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';

            const photoUrl = chercheur.photo || 'placeholder.png';
            const details = [
                chercheur.profession,
                chercheur.specialite,
                chercheur.axeRecherche
            ].filter(Boolean).join(' • ');

            div.innerHTML = `
                <img src="${photoUrl}" alt="" class="suggestion-photo">
                <div class="suggestion-info">
                    <div class="suggestion-name">${this.highlightMatch(chercheur.nomPrenom, searchTerm)}</div>
                    <div class="suggestion-details">${this.highlightMatch(details, searchTerm)}</div>
                </div>
            `;

            div.addEventListener('click', () => {
                this.selectSuggestion(chercheur);
            });

            this.suggestionsContainer.appendChild(div);
        });

        this.suggestionsContainer.classList.add('show');
    }

    highlightMatch(text, searchTerm) {
        if (!text) return '';
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    selectSuggestion(chercheur) {
        this.input.value = chercheur.nomPrenom;
        this.closeSuggestions();
        afficherChercheurs([chercheur]);
    }

    handleKeyNavigation(e) {
        const suggestions = this.suggestionsContainer.getElementsByClassName('suggestion-item');
        
        if (e.key === 'ArrowDown') {
            this.currentFocus++;
            this.addActive(suggestions);
            e.preventDefault();
        }
        else if (e.key === 'ArrowUp') {
            this.currentFocus--;
            this.addActive(suggestions);
            e.preventDefault();
        }
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.currentFocus > -1) {
                if (suggestions[this.currentFocus]) {
                    suggestions[this.currentFocus].click();
                }
            }
        }
        else if (e.key === 'Escape') {
            this.closeSuggestions();
        }
    }

    addActive(suggestions) {
        if (!suggestions) return;
        
        this.removeActive(suggestions);
        
        if (this.currentFocus >= suggestions.length) this.currentFocus = 0;
        if (this.currentFocus < 0) this.currentFocus = suggestions.length - 1;
        
        suggestions[this.currentFocus].classList.add('active');
        
        // Faire défiler jusqu'à l'élément actif
        suggestions[this.currentFocus].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }

    removeActive(suggestions) {
        Array.from(suggestions).forEach(suggestion => {
            suggestion.classList.remove('active');
        });
    }

    closeSuggestions() {
        this.suggestionsContainer.classList.remove('show');
        this.currentFocus = -1;
    }
}

// Initialisation de l'autocomplétion
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('globalSearch');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (searchInput && suggestionsContainer) {
        new Autocomplete(searchInput, suggestionsContainer);
    }

    // Toggle des filtres avancés
    const toggleButton = document.getElementById('toggleAdvancedSearch');
    const advancedContainer = document.getElementById('advancedSearchContainer');
    
    if (toggleButton && advancedContainer) {
        toggleButton.addEventListener('click', () => {
            const isCollapsed = advancedContainer.classList.contains('show');
            toggleButton.querySelector('i').classList.toggle('bi-sliders');
            toggleButton.querySelector('i').classList.toggle('bi-x-lg');
            
            if (isCollapsed) {
                bootstrap.Collapse.getInstance(advancedContainer).hide();
            } else {
                bootstrap.Collapse.getInstance(advancedContainer).show();
            }
        });
    }
});
