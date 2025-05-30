document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('surveyForm');
    const pages = document.querySelectorAll('.form-page');
    const progressBar = document.getElementById('progressBar');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const successMessage = document.getElementById('successMessage');
    const overlayVideo = document.getElementById('overlayVideo');
    let currentPage = 1;
    const totalPages = pages.length;

    const overlayGifs = [
        "videos/Gohan-vs-Gamma-1-2.gif",
        "videos/Gohan-vs-Gamma-2.gif",
        "videos/whis-et-beerus-sparking-zero-GIF.gif",
        "videos/Goku-Super-Saiyan-4-DAIMA-Eveil.gif",
        "videos/Vegetto-bras-croises-vs-Buuhan-1.gif",
        "videos/Vegeta-Super-Saiyan-3-Mini-2.gif",
        "videos/Goku-et-Vegeta-repo-machine-medicale.gif",
        "videos/luffy.gif"
    ];

    function updateProgress() {
        const progress = (currentPage - 1) / (totalPages - 1) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function updateOverlayVideo(pageNumber) {
        if (pageNumber >= 2 && pageNumber <= 9) {
            overlayVideo.style.backgroundImage = `url('${overlayGifs[pageNumber - 2]}')`;
            overlayVideo.classList.remove('hidden');
        } else {
            overlayVideo.classList.add('hidden');
            overlayVideo.style.backgroundImage = '';
        }
    }

    function showPage(pageNumber) {
        pages.forEach((page, index) => {
            if (index + 1 === pageNumber) {
                page.classList.remove('hidden');
                page.classList.add('active');
            } else {
                page.classList.remove('active');
                page.classList.add('hidden');
            }
        });
        updateProgress();
        updateOverlayVideo(pageNumber);
    }

    window.nextPage = function (currentPageNum) {
        const currentSection = document.getElementById(`page${currentPageNum}`);
        const errorMessages = currentSection.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());

        let isValid = true;

        if (currentPageNum === 1) {
            const genderSelected = Array.from(document.querySelectorAll('input[name="gender"]')).some(radio => radio.checked);
            const birthYear = document.getElementById('birthYear').value;

            if (!genderSelected) {
                showError(document.querySelector('input[name="gender"]').closest('.form-group'), 'Veuillez sélectionner votre genre');
                isValid = false;
            }

            if (!birthYear || birthYear < 2000 || birthYear > 2024) {
                showError(document.getElementById('birthYear').closest('.form-group'), 'Veuillez entrer une année entre 2000 et 2024');
                isValid = false;
            }
        } else {
            const requiredRadios = currentSection.querySelectorAll('input[type="radio"]');
            const radioGroups = {};

            requiredRadios.forEach(radio => {
                if (!radioGroups[radio.name]) {
                    radioGroups[radio.name] = [];
                }
                radioGroups[radio.name].push(radio);
            });

            for (const groupName in radioGroups) {
                const isChecked = radioGroups[groupName].some(radio => radio.checked);
                if (!isChecked) {
                    isValid = false;
                    const formGroup = radioGroups[groupName][0].closest('.form-group');
                    showError(formGroup, 'Veuillez sélectionner une option');
                }
            }
        }

        if (!isValid) return;

        const next = currentPageNum + 1;
        if (next <= totalPages) {
            currentPage = next;
            showPage(currentPage);
            window.scrollTo(0, 0);
        }
    };

    window.prevPage = function (currentPageNum) {
        const prev = currentPageNum - 1;
        if (prev >= 1) {
            currentPage = prev;
            showPage(currentPage);
            window.scrollTo(0, 0);
        }
    };

    function showError(formGroup, message) {
        let errorDiv = formGroup.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            formGroup.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        formGroup.classList.add('has-error');
    }

    function hideError(formGroup) {
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
        formGroup.classList.remove('has-error');
    }

    document.querySelectorAll('.emoji-radio input[type="radio"], .radio-button input[type="radio"]').forEach(input => {
        input.addEventListener('change', function () {
            document.querySelectorAll(`input[name="${this.name}"]`).forEach(r => {
                r.closest('.emoji-radio, .radio-button')?.classList.remove('selected');
            });

            this.closest('.emoji-radio, .radio-button')?.classList.add('selected');

            if (this.name === 'gender') {
                changeTheme();
            }

            const formGroup = this.closest('.form-group');
            if (formGroup) {
                hideError(formGroup);
            }
        });
    });

    document.querySelectorAll('.satisfaction-table input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const row = this.closest('tr');
            if (row) {
                row.querySelectorAll('td').forEach(td => td.classList.remove('selected'));
                this.parentElement?.classList.add('selected');
            }
        });
    });

    window.changeTheme = function () {
        const genderInputs = document.querySelectorAll('input[name="gender"]');
        const videos = {
            girl: document.getElementById('onePieceVideo'),
            boy: document.getElementById('dbzVideo'),
            default: document.getElementById('defaultVideo')
        };

        Object.values(videos).forEach(video => video.classList.add('hidden'));
        const selectedGender = Array.from(genderInputs).find(input => input.checked)?.value;

        if (selectedGender === 'girl') videos.girl.classList.remove('hidden');
        else if (selectedGender === 'boy') videos.boy.classList.remove('hidden');
        else videos.default.classList.remove('hidden');
    };

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validatePage(currentPage)) return;

        loadingOverlay.classList.remove('hidden');

        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            if (data[key]) {
                if (!Array.isArray(data[key])) data[key] = [data[key]];
                data[key].push(value);
            } else {
                data[key] = value;
            }
        });

        fetch("https://script.google.com/macros/s/AKfycbztAB63-cz4XhIrR2NmGYfvuftGs97niC8bim5MWOLlOJeVLy6SssvA61ZUMtHtzbCmnw/exec", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(() => {
            loadingOverlay.classList.add('hidden');
            form.style.display = 'none';
            successMessage.classList.remove('hidden');
        })
        .catch(err => {
            alert("Erreur lors de l'envoi du formulaire.");
            console.error(err);
        });
    });

    function validatePage(pageNum) {
        const currentPageElement = document.getElementById(`page${pageNum}`);
        const requiredInputs = currentPageElement.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (input.type === 'radio') {
                const radioGroup = currentPageElement.querySelectorAll(`input[name="${input.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isChecked) {
                    isValid = false;
                    showError(input.closest('.form-group'), 'Veuillez sélectionner une option');
                }
            } else if (input.type === 'number') {
                const value = parseInt(input.value);
                if (isNaN(value) || value < parseInt(input.min) || value > parseInt(input.max)) {
                    isValid = false;
                    showError(input.closest('.form-group'), `Veuillez entrer une année entre ${input.min} et ${input.max}`);
                }
            } else {
                if (!input.value.trim()) {
                    isValid = false;
                    showError(input.closest('.form-group'), 'Ce champ est requis');
                }
            }
        });

        return isValid;
    }

    updateProgress();
    updateOverlayVideo(currentPage);
});
