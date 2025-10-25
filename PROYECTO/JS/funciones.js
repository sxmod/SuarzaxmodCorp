// =========================
// FUNCIÓN: Mostrar Modal
// Descripción: Abre cualquier modal usando Bootstrap
// Parámetro: modalId - ID del modal a mostrar
// =========================
function showModal(modalId) {
    var modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

// =========================
// FUNCIÓN: Alternar Tema
// Descripción: Cambia entre modo oscuro y claro
// Cambia el icono del botón según el tema activo
// =========================
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    var themeIcon = document.getElementById('themeIcon');
    if (document.body.classList.contains('light-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Ocultar la animación de carga después de 4 segundos
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
    }, 4000);
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    const swiper = new Swiper('.swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        speed: 800,
        effect: "coverflow",
        coverflowEffect: {
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
        },
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            576: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            992: {
                slidesPerView: 3,
                spaceBetween: 30,
            }
        },
        preloadImages: true,
        lazy: {
            loadPrevNext: true,
            loadPrevNextAmount: 2,
        },
        watchSlidesProgress: true,
        watchSlidesVisibility: true,
        observer: true,
        observeParents: true
    });
    window.app = new App(); // Make app instance globally accessible
});

class App {
    constructor() {
        this.backgroundManager = new BackgroundManager();
        this.radioPlayer = new RadioPlayer();
        this.uiManager = new UIManager();
        this.authManager = new AuthManager(this.uiManager); // Pass UIManager to AuthManager
        this.searchManager = new SearchManager(this.uiManager); // Initialize SearchManager, passing uiManager
        this.preventDefaultBehaviors();
    }
    preventDefaultBehaviors() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('dragstart', e => e.preventDefault());
        document.addEventListener('selectstart', e => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
        document.addEventListener('keydown', e => {
            // Allow F12 for dev tools, but prevent others
            if (e.keyCode === 123) return; // F12
            if (
                (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I, Ctrl+Shift+J
                (e.ctrlKey && e.keyCode === 85) // Ctrl+U
            ) {
                e.preventDefault();
            }
        });
    }
}

class BackgroundManager {
    constructor() {
        this.container = document.getElementById('backgroundContainer');
        this.images = Array.from(this.container.querySelectorAll('.background-image'));
        this.imageUrls = [
            "https://i30.servimg.com/u/f30/20/30/93/75/milad-10.jpg",
            "https://i30.servimg.com/u/f30/20/30/93/75/rajat-10.jpg",
            "https://i30.servimg.com/u/f30/20/30/93/75/umbert10.jpg",
            "https://i30.servimg.com/u/f30/20/30/93/75/though10.jpg",
            "https://i30.servimg.com/u/f30/20/30/93/75/9421ed10.gif"
        ];
        this.currentIndex = 0;
        this.init();
    }
    init() {
        this.images.forEach((element, index) => {
            if (index < this.imageUrls.length) {
                element.style.backgroundImage = `url(${this.imageUrls[index]})`;
            }
        });
        this.images[0].classList.add('active');
        this.startRotation();
    }
    startRotation() {
        setInterval(() => {
            this.images.forEach(element => element.classList.remove('active'));
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
            this.images[this.currentIndex].classList.add('active');
        }, 8000);
    }
}

class RadioPlayer {
    constructor() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.radioPlayer = document.getElementById('radioPlayer');
        this.radioPlayerFullscreen = document.getElementById('radioPlayerFullscreen');
        this.playButton = document.getElementById('playButton');
        this.fullscreenPlayBtn = document.getElementById('fullscreenPlayBtn');
        this.showRadioBtn = document.getElementById('showRadioBtn');
        this.closePlayerBtn = document.getElementById('closePlayerBtn');
        this.expandPlayerBtn = document.getElementById('expandPlayerBtn');
        this.closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
        this.prevStationBtn = document.getElementById('prevStationBtn');
        this.nextStationBtn = document.getElementById('nextStationBtn');
        this.stationList = document.getElementById('stationList');
        
        this.isPlaying = false;
        this.isVisible = false;
        this.currentStation = null;
        this.currentStationIndex = 0;
        this.retryCount = 0;
        this.MAX_RETRIES = 5;
        
        this.stations = [
            { id: 23, name: "Olímpica Stereo", frequency: "105.9 FM", city: "Monteriá", image: "https://i30.servimg.com/u/f30/20/30/93/75/olimpi10.png" },
            { id: 2470, name: "Mix Radio", frequency: "96.3 FM", city: "Medellín", image: "https://i30.servimg.com/u/f30/20/30/93/75/mix-ra10.png" },
            { id: 2123, name: "Radio Potente", frequency: "98.7 FM", city: "Cali", image: "https://i30.servimg.com/u/f30/20/30/93/75/radio-10.png" },
            { id: 1210, name: "RADIO GRACIA Y AMOR", frequency: "103.5 FM", city: "Barranquilla", image: "https://i30.servimg.com/u/f30/20/30/93/75/gracia10.png" },
            { id: 682, name: "Carbon Stereo", frequency: "94.1 FM", city: "Bucaramanga", image: "https://i30.servimg.com/u/f30/20/30/93/75/carbon10.png" },
            { id: 163, name: "Radio Fantástica", frequency: "100.7 FM", city: "Cartagena", image: "https://i30.servimg.com/u/f30/20/30/93/75/fantas10.png" },
            { id: 157, name: "La Reina", frequency: "98.5 FM", city: "Santa Marta", image: "https://i30.servimg.com/u/f30/20/30/93/75/reina-10.png" },
            { id: 1624, name: "BPM Electro", frequency: "101.3 FM", city: "Pereira", image: "https://i30.servimg.com/u/f30/20/30/93/75/bpm-el10.png" },
            { id: 103, name: "RadioAcktiva", frequency: "97.9 FM", city: "Manizales", image: "https://i30.servimg.com/u/f30/20/30/93/75/radioa10.png" },
            { id: 28, name: "Olímpica Stereo", frequency: "93.7 FM", city: "Valledupar", image: "https://i30.servimg.com/u/f30/20/30/93/75/olimpi10.png" },
            { id: 1, name: "RCN Radio", frequency: "93.9 FM", city: "Bogotá", image: "https://i30.servimg.com/u/f30/20/30/93/75/rcn-ra10.png" },
            { id: 2, name: "Caracol Radio", frequency: "100.9 FM", city: "Bogotá", image: "https://i30.servimg.com/u/f30/20/30/93/75/caraco10.png" },
            { id: 3, name: "La Mega", frequency: "90.9 FM", city: "Bogotá", image: "https://i30.servimg.com/u/f30/20/30/93/75/la-meg10.png" },
            { id: 4, name: "Los 40 Principales", frequency: "97.4 FM", city: "Bogotá", image: "https://i30.servimg.com/u/f30/20/30/93/75/los-4010.png" },
            { id: 5, name: "Tropicana", frequency: "102.9 FM", city: "Bogotá", image: "https://i30.servimg.com/u/f30/20/30/93/75/tropic10.png" },
            { id: 6, name: "Radio Uno", frequency: "88.9 FM", city: "Bogotá", image: "https://i30.servimg.com/u/f30/20/30/93/75/radio-10.png" },
            { id: 7, name: "Candela Stereo", frequency: "101.9 FM", city: "Bogotá", image: "https://i30.servimg.com/u/f30/20/30/93/75/candel10.png" },
            { id: 8, name: "Vibra FM", frequency: "104.9 FM", city: "Bogotá", image: "https://i30.servimg.com/u/f30/20/30/93/75/vibra-10.png" },
            { id: 9, name: "Blu Radio", frequency: "96.9 FM", city: "Bogotá", image: "https://i30.servimg.com/u/f30/20/30/93/75/blu-ra10.png" },
            { id: 10, name: "La FM", frequency: "94.9 FM", city: "Bogotá", image: "https://i30.servimg.com/u/f30/20/30/93/75/la-fm-10.png" }
        ];
        this.init();
    }
    init() {
        // =========================
        // EVENT LISTENERS DEL REPRODUCTOR DE RADIO
        // Descripción: Configura todos los eventos del reproductor
        // =========================
        this.showRadioBtn.addEventListener('click', () => this.toggleRadioPlayer());
        this.closePlayerBtn.addEventListener('click', () => this.hideRadioPlayer());
        this.expandPlayerBtn.addEventListener('click', () => this.showFullscreenPlayer());
        this.closeFullscreenBtn.addEventListener('click', () => this.hideFullscreenPlayer());
        this.playButton.addEventListener('click', () => this.togglePlayback());
        this.fullscreenPlayBtn.addEventListener('click', () => this.togglePlayback());
        this.prevStationBtn.addEventListener('click', () => this.previousStation());
        this.nextStationBtn.addEventListener('click', () => this.nextStation());
        
        this.audioPlayer.addEventListener('error', () => this.retryPlayback());
        this.audioPlayer.addEventListener('playing', () => {
            this.retryCount = 0;
        });
        
        this.createStationList();
        
        if ('mediaSession' in navigator) {
            this.setupMediaSession();
        }
    }
    toggleRadioPlayer() {
        if (!this.isVisible) {
            if (!this.currentStation) {
                this.loadStation(this.stations[0].id);
            }
            this.radioPlayer.classList.add('active');
            this.isVisible = true;
        } else {
            this.hideRadioPlayer();
        }
    }
    
    // =========================
    // FUNCIÓN: Ocultar Reproductor de Radio
    // Descripción: Oculta el reproductor mini y actualiza estado
    // =========================
    hideRadioPlayer() {
        this.radioPlayer.classList.remove('active');
        this.isVisible = false;
    }
    
    // =========================
    // FUNCIÓN: Mostrar Reproductor en Pantalla Completa
    // Descripción: Abre el reproductor en modo fullscreen
    // =========================
    showFullscreenPlayer() {
        this.radioPlayerFullscreen.style.display = 'flex';
        this.radioPlayer.classList.remove('active');
    }
    
    // =========================
    // FUNCIÓN: Ocultar Reproductor en Pantalla Completa
    // Descripción: Cierra el modo fullscreen y restaura mini player si estaba activo
    // =========================
    hideFullscreenPlayer() {
        this.radioPlayerFullscreen.style.display = 'none';
        if (this.isVisible) {
            this.radioPlayer.classList.add('active');
        }
    }
    togglePlayback() {
        this.isPlaying = !this.isPlaying;
        this.updatePlayButtonUI();
        
        if (this.isPlaying) {
            this.audioPlayer.play().catch(error => {
                console.error("Error al reproducir:", error);
                setTimeout(() => this.retryPlayback(), 1000); // Retry immediately on play error
            });
        } else {
            this.audioPlayer.pause();
        }
        
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
        }
    }
    updatePlayButtonUI() {
        const playIcon = this.isPlaying ? 'fa-pause' : 'fa-play';
        this.playButton.querySelector('i').className = `fas ${playIcon}`;
        this.fullscreenPlayBtn.querySelector('i').className = `fas ${playIcon}`;
    }
    async loadStation(id) {
        try {
            const station = this.stations.find(s => s.id === id);
            if (!station) return;
            
            const data = await this.fetchStationData(id);
            
            if (data && data.data && data.data.station) {
                this.currentStation = {
                    ...station,
                    ...data.data.station
                };
                
                document.getElementById('stationLogo').src = this.currentStation.image;
                document.getElementById('fullscreenStationLogo').src = this.currentStation.image;
                this.audioPlayer.src = this.currentStation.stream;
                
                let title = this.currentStation.title || this.currentStation.name;
                if (this.currentStation.frequency) {
                    title = `${title} - ${this.currentStation.frequency} ${this.currentStation.city}`;
                }
                document.getElementById('stationName').textContent = title;
                document.getElementById('fullscreenStationName').textContent = title;
                
                const stationInfo = `Posición: ${this.currentStation.position || '-'} | Clasificación: ${this.currentStation.rating || '0'}`;
                document.getElementById('stationMeta').textContent = stationInfo;
                document.getElementById('fullscreenStationMeta').textContent = stationInfo;
                
                this.updateMediaSession(this.currentStation);
                
                this.isPlaying = true;
                this.updatePlayButtonUI();
                this.audioPlayer.play().catch(error => {
                    console.error("Error al reproducir:", error);
                    this.retryPlayback();
                });
                
                this.retryCount = 0;
                this.updateActiveStation(id);
                this.currentStationIndex = this.stations.findIndex(s => s.id === id);
            }
        } catch (error) {
            console.error("Error al cargar la estación:", error);
            this.retryPlayback();
        }
    }
    async fetchStationData(id) {
        try {
            const response = await fetch("https://emisorasenvivo.com.co/api-backend.php", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ id: id, action: "station-for-widget" })
            });
            return await response.json();
        } catch (error) {
            console.error("Error en la petición:", error);
            return null;
        }
    }
    createStationList() {
        const fragment = document.createDocumentFragment();
        
        this.stations.forEach(station => {
            const stationElement = document.createElement('div');
            stationElement.className = 'station-item';
            stationElement.dataset.id = station.id;
            
            stationElement.innerHTML = `
                <img src="${station.image}" alt="${station.name}" class="station-item-logo">
                <div class="station-item-info">
                    <h5 class="station-item-name">${station.name}</h5>
                    <div class="station-item-freq">${station.frequency} ${station.city}</div>
                </div>
            `;
            
            stationElement.addEventListener('click', () => {
                this.loadStation(station.id);
            });
            
            fragment.appendChild(stationElement);
        });
        
        this.stationList.appendChild(fragment);
    }
    updateActiveStation(id) {
        const stationItems = document.querySelectorAll('.station-item');
        stationItems.forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.id) === id) {
                item.classList.add('active');
            }
        });
    }
    previousStation() {
        this.currentStationIndex = (this.currentStationIndex - 1 + this.stations.length) % this.stations.length;
        this.loadStation(this.stations[this.currentStationIndex].id);
    }
    nextStation() {
        this.currentStationIndex = (this.currentStationIndex + 1) % this.stations.length;
        this.loadStation(this.stations[this.currentStationIndex].id);
    }
    setupMediaSession() {
        if (!('mediaSession' in navigator)) return;
        
        navigator.mediaSession.setActionHandler('play', () => {
            this.audioPlayer.play();
            this.isPlaying = true;
            this.updatePlayButtonUI();
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
            this.audioPlayer.pause();
            this.isPlaying = false;
            this.updatePlayButtonUI();
        });
        
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            this.previousStation();
        });
        
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            this.nextStation();
        });
    }
    updateMediaSession(station) {
        if (!('mediaSession' in navigator)) return;
        
        navigator.mediaSession.metadata = new MediaMetadata({
            title: station.title || station.name,
            artist: station.frequency ? `${station.frequency} ${station.city}` : 'Radio Suarzaxmod',
            album: 'Radio App Suarzaxmod',
            artwork: [
                { src: station.image, sizes: '96x96', type: 'image/png' },
                { src: station.image, sizes: '128x128', type: 'image/png' },
                { src: station.image, sizes: '192x192', type: 'image/png' },
                { src: station.image, sizes: '256x256', type: 'image/png' },
                { src: station.image, sizes: '384x384', type: 'image/png' },
                { src: station.image, sizes: '512x512', type: 'image/png' }
            ]
        });
    }
    retryPlayback() {
        if (this.retryCount < this.MAX_RETRIES) {
            this.retryCount++;
            console.log(`Reintentando reproducción (intento ${this.retryCount})...`);
            this.audioPlayer.load();
            this.audioPlayer.play().catch(error => {
                console.error(`Error en el reintento ${this.retryCount}:`, error);
                setTimeout(() => this.retryPlayback(), 2000 * this.retryCount);
            });
        } else {
            console.error("Número máximo de reintentos alcanzado.");
            if (this.currentStation) {
                this.loadStation(this.currentStation.id);
            }
            this.retryCount = 0;
        }
    }
}

class UIManager {
    constructor() {
        this.profileModal = document.getElementById('profileModal');
        this.showProfileBtn = document.getElementById('showProfileBtn');
        this.closeProfileBtn = document.getElementById('closeProfileBtn');
        this.toggleThemeBtn = document.getElementById('toggleThemeBtn');
        this.toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');
        this.moreMenuBtn = document.getElementById('moreMenuBtn');
        this.moreMenuContent = document.getElementById('moreMenuContent');
        this.userInfoDisplay = document.getElementById('userInfoDisplay');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.notification = document.getElementById('notification');
        this.notificationTitle = this.notification.querySelector('.notification-title');
        this.notificationMessage = this.notification.querySelector('.notification-message');
        this.notificationIcon = this.notification.querySelector('.notification-icon');
        // Category Fullscreen Modal elements
        this.categoryFullscreenModal = document.getElementById('categoryFullscreenModal');
        this.closeCategoryFullscreenBtn = document.getElementById('closeCategoryFullscreenBtn');
        this.categoryDynamicContent = document.getElementById('categoryDynamicContent');
        this.isFullscreen = false;
        this.isMoreMenuOpen = false;
        
        this.categoryData = {
            'libros': {
                title: 'Sección Libros',
                type: 'iframe',
                url: 'https://librosonlinesxm.blogspot.com/?m=0'
            },
            'aplicacion': { title: 'Sección Aplicaciones', type: 'iframe', url: 'https://sxmod96aplicaciones.blogspot.com/?m=0' },
            'electricidad': { title: 'Sección Electricidad', type: 'iframe', url: 'https://electricidadseccion.blogspot.com/?m=0' },
            'pelisx': { title: 'pelisx', type: 'iframe', url: 'https://cinehousesuarzaxmod.blogspot.com/?m=0' },
            'videos-plc': { title: 'Videos PLC', type: 'iframe', url: 'https://seccionvideosuarzaxmod.blogspot.com/?m=0' },
            'sistema': { title: 'Sección Sistema', type: 'iframe', url: 'https://nodisponiblesitio.blogspot.com/?m=0' },
            'simuladores': { title: 'Sección Simuladores', type: 'iframe', url: 'https://seccionsimuladores.blogspot.com/?m=0' },
            'program-for-windows': { title: 'Programas para Windows', type: 'iframe', url: 'https://seccionprogramas.blogspot.com/?m=0' },
            'notificaciones': {
                title: 'Notificaciones del Sistema',
                type: 'internal',
                htmlContent: `
                    <p>Aquí verás tus notificaciones importantes:</p>
                    <ul style="list-style: none; padding: 0; text-align: left; width: 100%; max-width: 400px; margin-top: 20px;">
                        <li style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-info-circle" style="color: var(--primary-color);"></i>
                            <span>Nueva actualización disponible.</span>
                        </li>
                        <li style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-bell" style="color: var(--accent-color);"></i>
                            <span>Recordatorio: Revisa la sección de libros.</span>
                        </li>
                        <li style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                            <span>Tu perfil ha sido actualizado.</span>
                        </li>
                    </ul>
                `
            },
            'Suarzaxmpod-App': { title: 'Apks', type: 'iframe', url: 'https://sxmod96aplicaciones.blogspot.com/?m=0' }, // Example, replace with actual URL
            'espacio-apk': { title: 'Espacio APK', type: 'iframe', url: 'https://espacioapk.com/' },
            'modi-limitado': { title: 'Modi Limitado', type: 'iframe', url: 'https://modilimitado.io/' },
            'all-mod-apk': { title: 'All Mod APK', type: 'iframe', url: 'https://allmodapk.de/' },
            'apk-gstore': { title: 'APK GStore', type: 'iframe', url: 'https://apkgstore.com/' },
            '123-juegos': { title: 'Juega online', type: 'iframe', url: 'https://poki.com/es' },
            'donaciones': { title: 'Donaciones', type: 'internal', htmlContent: '<p>Apoya nuestro proyecto. Aquí puedes integrar opciones de donación.</p><p>¡Cada contribución nos ayuda a crecer!</p>' },
            'radio': {
                title: 'Radio Suarzaxmod',
                type: 'action', // Special type for direct action
                action: () => app.radioPlayer.showFullscreenPlayer()
            }
        };
        this.init();
    }
    init() {
        // =========================
        // EVENT LISTENERS DEL UI MANAGER
        // Descripción: Configura todos los eventos de la interfaz de usuario
        // =========================
        this.showProfileBtn.addEventListener('click', () => this.showProfileModal());
        this.closeProfileBtn.addEventListener('click', () => this.hideProfileModal());
        this.toggleThemeBtn.addEventListener('click', () => this.toggleTheme());
        this.toggleFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.moreMenuBtn.addEventListener('click', () => this.toggleMoreMenu());
        this.logoutBtn.addEventListener('click', () => this.logout());
        
        // Category Fullscreen Modal Event Listener
        this.closeCategoryFullscreenBtn.addEventListener('click', () => this.closeCategoryFullscreen());
        document.addEventListener('click', (e) => {
            if (this.isMoreMenuOpen && !this.moreMenuBtn.contains(e.target) && !this.moreMenuContent.contains(e.target)) {
                this.closeMoreMenu();
            }
        });
        
        this.profileModal.addEventListener('click', (e) => {
            if (e.target === this.profileModal) {
                this.hideProfileModal();
            }
        });
        
        this.loadUserProfile();
    }
    showProfileModal() {
        console.log("[UIManager] Mostrando modal de perfil.");
        this.profileModal.style.display = 'flex';
        this.closeMoreMenu();
    }
    
    // =========================
    // FUNCIÓN: Ocultar Modal de Perfil
    // Descripción: Cierra el modal del perfil de usuario
    // =========================
    hideProfileModal() {
        console.log("[UIManager] Ocultando modal de perfil.");
        this.profileModal.style.display = 'none';
    }
    
    // =========================
    // FUNCIÓN: Alternar Tema
    // Descripción: Cambia entre modo oscuro y claro, actualiza icono
    // =========================
    toggleTheme() {
        document.body.classList.toggle('light-mode');
        const isLightMode = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
        
        const icon = this.toggleThemeBtn.querySelector('i');
        icon.className = isLightMode ? 'fas fa-sun' : 'fas fa-moon';
        
        this.closeMoreMenu();
    }
    toggleFullscreen() {
        if (!this.isFullscreen) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
        
        this.isFullscreen = !this.isFullscreen;
        const icon = this.toggleFullscreenBtn.querySelector('i');
        icon.className = this.isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
        
        this.closeMoreMenu();
    }
    toggleMoreMenu() {
        this.isMoreMenuOpen = !this.isMoreMenuOpen;
        this.moreMenuContent.classList.toggle('show', this.isMoreMenuOpen);
    }
    closeMoreMenu() {
        this.isMoreMenuOpen = false;
        this.moreMenuContent.classList.remove('show');
    }
    loadUserProfile() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
            document.getElementById('displayName').textContent = userData.name;
            document.getElementById('displayEmail').textContent = userData.email;
            document.getElementById('displayAge').textContent = userData.age;
            document.getElementById('displayGender').textContent = this.getGenderText(userData.gender);
            
            this.userInfoDisplay.style.display = 'block';
            document.getElementById('userStatusIndicator').classList.add('active');
        }
    }
    getGenderText(gender) {
        const genderMap = {
            'male': 'Masculino',
            'female': 'Femenino',
            'other': 'Otro',
            'prefer-not-to-say': 'Prefiero no decir'
        };
        return genderMap[gender] || gender;
    }
    logout() {
        localStorage.removeItem('userData');
        localStorage.removeItem('isLoggedIn');
        this.showNotification('Sesión cerrada', 'Has cerrado sesión exitosamente', 'success');
        this.hideProfileModal();
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
    showNotification(title, message, type = 'info') {
        console.log(`[UIManager] Mostrando notificación: ${title} - ${message} (${type})`);
        this.notificationTitle.textContent = title;
        this.notificationMessage.textContent = message;
        this.notificationIcon.className = `notification-icon fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-info'}`;
        this.notificationIcon.classList.add(type); // Add type class for background color
        
        this.notification.classList.add('show');
        
        setTimeout(() => {
            console.log("[UIManager] Ocultando notificación.");
            this.notification.classList.remove('show');
            this.notificationIcon.classList.remove(type); // Clean up type class
        }, 3000);
    }
    // New: Open Category Fullscreen Modal
    openCategoryFullscreen(categoryId) {
        console.log(`[UIManager] Intentando abrir categoría: ${categoryId}`);
        const categoryInfo = this.categoryData[categoryId];
        if (!categoryInfo) {
            this.showNotification('Error', 'Categoría no encontrada.', 'error');
            console.error(`[UIManager] Información de categoría no encontrada para: ${categoryId}`);
            return;
        }
        console.log(`[UIManager] Información de categoría encontrada:`, categoryInfo);
        // Manejar tipos de acción especiales (ej. abrir el reproductor de radio)
        if (categoryInfo.type === 'action' && typeof categoryInfo.action === 'function') {
            console.log(`[UIManager] Ejecutando acción para la categoría: ${categoryId}`);
            categoryInfo.action();
            return; // No abrir el modal genérico para acciones
        }
        this.categoryDynamicContent.innerHTML = ''; // Limpiar contenido previo
        if (categoryInfo.type === 'iframe' && categoryInfo.url) {
            console.log(`[UIManager] Cargando iframe para: ${categoryInfo.url}`);
            // Añadir indicador de carga
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'iframe-loading-indicator';
            loadingDiv.innerHTML = `
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p>Cargando contenido de ${categoryInfo.title}...</p>
                <p style="font-size: 0.8rem; color: var(--muted-text);">Si la página no carga, es posible que el sitio no permita ser incrustado (problema de CORS/X-Frame-Options).</p>
            `;
            this.categoryDynamicContent.appendChild(loadingDiv);
            const iframe = document.createElement('iframe');
            iframe.src = categoryInfo.url;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '0';
            iframe.style.display = 'none';

            // Cambios solo para pelisx y videos-plc
            if (categoryId === 'pelisx' || categoryId === 'videos-plc') {
                iframe.setAttribute('allowfullscreen', '');
                iframe.setAttribute('webkitallowfullscreen', '');
                iframe.setAttribute('mozallowfullscreen', '');
                iframe.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture');

                // Botón flotante fullscreen
                const fsBtn = document.createElement('button');
                fsBtn.className = 'iframe-force-fullscreen-btn';
                fsBtn.title = 'Pantalla completa';
                fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
                fsBtn.style.position = 'absolute';
                fsBtn.style.top = '12px';
                fsBtn.style.right = '12px';
                fsBtn.style.zIndex = '9999';
                fsBtn.style.background = 'rgba(0,0,0,0.45)';
                fsBtn.style.border = 'none';
                fsBtn.style.color = 'white';
                fsBtn.style.width = '44px';
                fsBtn.style.height = '44px';
                fsBtn.style.borderRadius = '8px';
                fsBtn.style.display = 'flex';
                fsBtn.style.alignItems = 'center';
                fsBtn.style.justifyContent = 'center';
                fsBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    try {
                        if (iframe.requestFullscreen) iframe.requestFullscreen();
                        else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
                        else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
                        else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
                    } catch (err) {
                        console.error('[UIManager] Error al solicitar fullscreen:', err);
                    }
                };
                this.categoryDynamicContent.appendChild(fsBtn);
            }

            iframe.onload = () => {
                loadingDiv.style.display = 'none';
                iframe.style.display = 'block';
            };
            iframe.onerror = () => {
                loadingDiv.innerHTML = `
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 15px;"></i>
                    <p class="iframe-error-message">No se pudo cargar el contenido de ${categoryInfo.title}.</p>
                `;
                iframe.remove();
            };

            this.categoryDynamicContent.appendChild(iframe);
} else if (categoryInfo.type === 'internal' && categoryInfo.htmlContent) {
            console.log(`[UIManager] Cargando HTML interno para: ${categoryId}`);
            this.categoryDynamicContent.innerHTML = categoryInfo.htmlContent;
        } else {
            console.log(`[UIManager] Contenido no disponible para: ${categoryId}`);
            this.categoryDynamicContent.innerHTML = '<p>Contenido no disponible para esta categoría.</p>';
        }
        this.categoryFullscreenModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevenir el scroll del body
        console.log(`[UIManager] El modal debería estar visible ahora para: ${categoryId}`);
    }
    
    // =========================
    // FUNCIÓN: Cerrar Modal de Categoría en Pantalla Completa
    // Descripción: Cierra el modal fullscreen de categorías y limpia contenido
    // =========================
    closeCategoryFullscreen() {
        console.log("[UIManager] Cerrando modal de categoría en pantalla completa.");
        this.categoryFullscreenModal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restaurar el scroll del body
        this.categoryDynamicContent.innerHTML = ''; // Limpiar contenido al cerrar
    }
}
class SearchManager {
    constructor(uiManager) { // uiManager is passed here
        this.uiManager = uiManager; // Store it
        this.mainSearchUI = document.getElementById('mainSearchUI');
        this.searchInput = document.getElementById('searchInput');
        this.searchResultsContainer = document.getElementById('searchResultsContainer');
        this.searchButton = document.getElementById('searchButton');
        this.finalSearchResults = document.getElementById('finalSearchResults');
        this.closeMainSearchUIBtn = document.getElementById('closeMainSearchUIBtn');
        this.searchableItems = [];
        this.initSearchableItems(); // This call needs to use this.uiManager
        this.init();
    }
    initSearchableItems() {
        this.searchableItems = []; // Clear to prevent duplicates if called multiple times
        // Add categories to searchable items
        for (const key in this.uiManager.categoryData) { // CORRECTED: Use this.uiManager
            const category = this.uiManager.categoryData[key]; // CORRECTED: Use this.uiManager
            if (category.type !== 'action') { // Exclude radio as it's an action
                let description = '';
                if (category.type === 'iframe') {
                    description = `Contenido externo de ${category.title}`;
                } else if (category.type === 'internal') {
                    // For internal content, provide specific descriptions
                    if (key === 'notificaciones') {
                        description = 'Tus notificaciones y alertas del sistema.';
                    } else if (key === 'search') {
                        description = 'Herramienta para buscar contenido en la aplicación.';
                    } else if (key === 'donaciones') {
                        description = 'Apoya nuestro proyecto con una donación.';
                    } else {
                        description = `Información interna sobre ${category.title}.`;
                    }
                }
                this.searchableItems.push({
                    id: key,
                    name: category.title,
                    description: description,
                    type: category.type
                });
            }
        }
        // Add swiper data to searchable items (assuming it's still relevant for search)
        const swiperData = [
            { id: 'apks', title: 'Suarzaxmod Apps', description: 'Oficiales de Suarzaxmod' },
            { id: 'espacio-apk', title: 'Espacio APK', description: 'Descarga aplicaciones premium' },
            { id: 'modi-limitado', title: 'Modi Limitado', description: 'Mods sin límites' },
            { id: 'all-mod-apk', title: 'All Mod APK', description: 'Todos los mods en un solo lugar' },
            { id: 'apk-gstore', title: 'APK GStore', description: 'Tu tienda de aplicaciones' },
            { id: 'get-mods-apk', title: 'Get Mods APK', description: 'Descarga mods fácilmente' }
        ];
        swiperData.forEach(item => {
            this.searchableItems.push({
                id: item.id,
                name: item.title,
                description: item.description,
                type: 'socio' // Indicate it's a partner
            });
        });
    }
    init() {
        // =========================
        // EVENT LISTENER DEL SEARCH MANAGER
        // Descripción: Configura el evento para cerrar la búsqueda
        // =========================
        this.closeMainSearchUIBtn.addEventListener('click', () => this.hideSearchUI());
    }
    
    // =========================
    // FUNCIÓN: Alternar UI de Búsqueda
    // Descripción: Abre o cierra la interfaz de búsqueda según su estado actual
    // =========================
    toggleSearchUI() {
        if (this.mainSearchUI.classList.contains('show')) {
            this.hideSearchUI();
        } else {
            this.showSearchUI();
        }
    }
    
    // =========================
    // FUNCIÓN: Mostrar UI de Búsqueda
    // Descripción: Abre la interfaz de búsqueda y prepara el estado inicial
    // =========================
    showSearchUI() {
        console.log("[SearchManager] Mostrando UI de búsqueda principal.");
        this.mainSearchUI.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevenir el scroll del body
        this.searchInput.value = ''; // Limpiar búsqueda previa
        this.finalSearchResults.innerHTML = ''; // Limpiar resultados previos
        this.searchResultsContainer.innerHTML = ''; // Limpiar sugerencias
        this.searchResultsContainer.style.display = 'none'; // Ocultar sugerencias
        this.searchInput.focus(); // Enfocar el input para abrir el teclado
    }
    
    // =========================
    // FUNCIÓN: Ocultar UI de Búsqueda
    // Descripción: Cierra la interfaz de búsqueda y restaura el scroll
    // =========================
    hideSearchUI() {
        console.log("[SearchManager] Ocultando UI de búsqueda principal.");
        this.mainSearchUI.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restaurar el scroll del body
    }
    
    // =========================
    // FUNCIÓN: Actualizar Sugerencias de Búsqueda
    // Descripción: Actualiza las sugerencias basadas en la consulta del usuario
    // =========================
    updateSearchSuggestions(query) {
        const lowerCaseQuery = query.toLowerCase().trim();
        this.searchResultsContainer.innerHTML = ''; // Clear previous suggestions
        if (lowerCaseQuery.length === 0) {
            this.searchResultsContainer.style.display = 'none';
            return;
        }
        const filteredResults = this.searchableItems.filter(item =>
            item.name.toLowerCase().includes(lowerCaseQuery) ||
            (item.description && item.description.toLowerCase().includes(lowerCaseQuery))
        );
        if (filteredResults.length > 0) {
            filteredResults.forEach(result => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'search-suggestion-item';
                suggestionItem.innerHTML = `
                    <strong>${result.name}</strong>
                    <small>${result.description.substring(0, 50)}${result.description.length > 50 ? '...' : ''}</small>
                `;
                suggestionItem.onclick = () => {
                    this.uiManager.openCategoryFullscreen(result.id); // Open the corresponding category
                    this.hideSearchUI(); // Hide search UI after opening category
                };
                this.searchResultsContainer.appendChild(suggestionItem);
            });
            this.searchResultsContainer.style.display = 'block';
        } else {
            this.searchResultsContainer.style.display = 'none';
        }
    }
    performSearch(query) {
        const lowerCaseQuery = query.toLowerCase().trim();
        let foundResults = [];
        if (lowerCaseQuery.length === 0) {
            this.finalSearchResults.innerHTML = `<p>Por favor, ingresa un término de búsqueda.</p>`;
            return;
        }
        foundResults = this.searchableItems.filter(item =>
            item.name.toLowerCase().includes(lowerCaseQuery) ||
            (item.description && item.description.toLowerCase().includes(lowerCaseQuery))
        );
        if (foundResults.length > 0) {
            let resultsHtml = `<p>Resultados para "<strong>${query}</strong>":</p><ul>`;
            foundResults.forEach(result => {
                resultsHtml += `<li><strong>${result.name}</strong> (${result.type || 'Elemento'}): ${result.description.substring(0, 100)}${result.description.length > 100 ? '...' : ''} <a href="javascript:void(0);" onclick="app.uiManager.openCategoryFullscreen('${result.id}'); app.searchManager.hideSearchUI();">Ver</a></li>`;
            });
            resultsHtml += `</ul>`;
            this.finalSearchResults.innerHTML = resultsHtml;
        } else {
            this.finalSearchResults.innerHTML = `<p>No se encontraron resultados para "<strong>${query}</strong>".</p>`;
        }
        this.searchResultsContainer.style.display = 'none'; // Hide suggestions after explicit search
    }
}
class AuthManager {
    constructor(uiManager) {
        this.uiManager = uiManager; // Inject UIManager
        this.welcomeBanner = document.getElementById('welcomeBanner');
        this.welcomeRegisterForm = document.getElementById('welcomeRegisterForm');
        this.welcomeLoginForm = document.getElementById('welcomeLoginForm');
        this.registerTab = document.getElementById('registerTab');
        this.loginTab = document.getElementById('loginTab');
        
        this.init();
    }
    init() {
        this.checkAuthStatus();
        
        this.welcomeRegisterForm.addEventListener('submit', (e) => this.handleRegister(e));
        this.welcomeLoginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerTab.addEventListener('click', () => this.showRegisterForm());
        this.loginTab.addEventListener('click', () => this.showLoginForm());
        
        this.loadTheme();
    }
    checkAuthStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
            this.hideWelcomeBanner();
        } else {
            this.showWelcomeBanner();
            // Ensure register form is active by default if not logged in
            this.showRegisterForm(); 
        }
    }
    showRegisterForm() {
        this.registerTab.classList.add('active');
        this.loginTab.classList.remove('active');
        this.welcomeRegisterForm.classList.add('active');
        this.welcomeLoginForm.classList.remove('active');
    }
    showLoginForm() {
        this.loginTab.classList.add('active');
        this.registerTab.classList.remove('active');
        this.welcomeRegisterForm.classList.remove('active');
        this.welcomeLoginForm.classList.add('active');
    }
    handleRegister(e) {
        e.preventDefault();
        console.log("[AuthManager] Manejando registro.");
        
        const formData = {
            name: document.getElementById('welcomeName').value,
            email: document.getElementById('welcomeEmail').value,
            password: document.getElementById('welcomePassword').value,
            age: document.getElementById('welcomeAge').value,
            gender: document.getElementById('welcomeGender').value
        };
        
        if (!document.getElementById('welcomeTerms').checked) {
            this.uiManager.showNotification('Error', 'Debes aceptar los términos y condiciones', 'error');
            return;
        }
        
        localStorage.setItem('userData', JSON.stringify(formData));
        localStorage.setItem('isLoggedIn', 'true');
        
        this.uiManager.showNotification('¡Bienvenido!', `Cuenta creada exitosamente para ${formData.name}`, 'success');
        
        setTimeout(() => {
            this.hideWelcomeBanner();
        }, 2000);
    }
    handleLogin(e) {
        e.preventDefault();
        console.log("[AuthManager] Manejando inicio de sesión.");
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData.email === email && userData.password === password) {
            localStorage.setItem('isLoggedIn', 'true');
            this.uiManager.showNotification('¡Bienvenido de vuelta!', `Sesión iniciada como ${userData.name}`, 'success');
            setTimeout(() => {
                this.hideWelcomeBanner();
            }, 2000);
        } else {
            this.uiManager.showNotification('Error', 'Credenciales incorrectas', 'error');
        }
    }
    showWelcomeBanner() {
        console.log("[AuthManager] Mostrando banner de bienvenida.");
        this.welcomeBanner.classList.remove('hidden');
        this.welcomeBanner.style.display = 'flex';
    }
    hideWelcomeBanner() {
        console.log("[AuthManager] Ocultando banner de bienvenida.");
        this.welcomeBanner.classList.add('hidden');
        setTimeout(() => {
            this.welcomeBanner.style.display = 'none';
        }, 500);
    }
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
        }
    }
}
