// js/avatar.js
// Preview e upload dell'immagine profilo

const Avatar = {

    inizializza(idWrapper, idInput, idPreview) {
        const wrapper = document.getElementById(idWrapper);
        const input   = document.getElementById(idInput);
        const preview = document.getElementById(idPreview);
        if (!wrapper || !input || !preview) return;

        wrapper.addEventListener('click', () => input.click());

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Seleziona un\'immagine.');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                alert('Immagine troppo grande. Max 2MB.');
                input.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.borderColor = 'var(--colore-primario)';
            };
            reader.readAsDataURL(file);
        });
    },

    async carica(idInput) {
        const input = document.getElementById(idInput);
        if (!input || !input.files[0]) return null;
        const formData = new FormData();
        formData.append('avatar', input.files[0]);
        try {
            const risposta = await Api.uploadAvatar(formData);
            return risposta.avatar_url;
        } catch (err) {
            console.warn('Upload avatar fallito:', err.message);
            return null;
        }
    }
};
