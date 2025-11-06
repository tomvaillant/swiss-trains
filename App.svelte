<script>
    import { onMount } from 'svelte';
    import Map from './Map.svelte';

    let showMap = false;
    let mapLoaded = false;
    let loadingProgress = 0;
    let loadingStatus = 'Loading...';
    let currentPosition = 'position-0';
    let showExploreMessage = false;
    let minimumLoadTimeElapsed = false;
    let blockMapInteraction = true;

    function handleMapStatus(event) {
        const { detail } = event;
        if (detail.type === 'load') {
            mapLoaded = true;
            loadingProgress = 100;
            loadingStatus = 'Loaded!';
            updateLoader();
            // Only hide loader if minimum load time has elapsed
            if (minimumLoadTimeElapsed) {
                hideLoader();
            }
        } else if (detail.type === 'progress') {
            loadingProgress = detail.progress || loadingProgress;
            loadingStatus = detail.message || loadingStatus;
            updateLoader();
        } else if (detail.type === 'positionChange') {
            currentPosition = detail.position;
        } else if (detail.type === 'exploreMode') {
            blockMapInteraction = false; // Remove blocking overlay
            fadeInNavigationControls(); // Fade in the map controls
            triggerExploreMode(); // Show the explore message
        }
    }

    function updateLoader() {
        const loaderText = document.getElementById('loader-text');
        const loaderProgress = document.getElementById('loader-progress-fill');
        if (loaderText) loaderText.textContent = loadingStatus;
        if (loaderProgress) loaderProgress.style.width = `${loadingProgress}%`;
    }

    function hideLoader() {
        const loaderContainer = document.getElementById('loader-container');
        if (loaderContainer) {
            loaderContainer.classList.add('fade-out');
            setTimeout(() => {
                loaderContainer.style.display = 'none';
            }, 500);
        }
    }

    function fadeInNavigationControls() {
        const controlElement = document.querySelector('.maplibregl-ctrl-top-right');
        if (controlElement) {
            controlElement.style.opacity = '0';
            controlElement.style.display = 'block';
            controlElement.style.transition = 'opacity 0.8s ease-in-out';
            setTimeout(() => {
                controlElement.style.opacity = '1';
            }, 50);
        }
    }

    function triggerExploreMode() {
        // Show the explore message
        showExploreMessage = true;

        // Hide the message after 2.5 seconds (fade animations included)
        setTimeout(() => {
            showExploreMessage = false;
        }, 2500);
    }

    onMount(() => {
        const maxLoadingTime = 10000;
        const minLoadTime = 2000; // Minimum 2 second pre-load

        // Animate progress bar during initial load
        const progressInterval = setInterval(() => {
            if (loadingProgress < 90 && !mapLoaded) {
                loadingProgress += 10;
                updateLoader();
            }
        }, 200);

        // Start showing map after brief delay
        setTimeout(() => {
            showMap = true;
        }, 100);

        // Set minimum load time flag after 2 seconds
        const minLoadTimer = setTimeout(() => {
            minimumLoadTimeElapsed = true;
            clearInterval(progressInterval);
            // If map already loaded, hide loader now
            if (mapLoaded) {
                hideLoader();
            }
        }, minLoadTime);

        // Fallback timer for very slow loads
        const fallbackTimer = setTimeout(() => {
            const loaderContainer = document.getElementById('loader-container');
            if (loaderContainer && !loaderContainer.classList.contains('fade-out')) {
                loadingStatus = 'Loading is taking longer than expected...';
                loadingProgress = 90;
                updateLoader();
                setTimeout(hideLoader, 3000);
            }
        }, maxLoadingTime);

        return () => {
            clearTimeout(fallbackTimer);
            clearTimeout(minLoadTimer);
            clearInterval(progressInterval);
        };
    });
</script>

<main>
    {#if showMap}
        <Map on:mapStatus={handleMapStatus} />
    {/if}

    <!-- Blocking overlay - prevents map interaction during scrolly -->
    {#if blockMapInteraction}
        <div class="map-interaction-blocker"></div>
    {/if}

    <div class="scrollytelling">
        <section id="position-0" class="active">
            <div class="textbox">
                <strong>The Swiss Alps</strong>
                Welcome to Andermatt, nestled in the heart of the Swiss Alps. These mountains are mapped with legendary Swiss precision — featuring hand-drawn reliefs of cliffs and glaciers that make SwissTopo maps renowned worldwide for their detail, beauty and distinctive style.
            </div>
        </section>

        <section id="position-1">
            <div class="textbox">
                <strong>Precision Cartography</strong>
                Flying through the valley to Fiesch, you're viewing data from Switzerland's Federal Office of Topography. SwissTopo maintains truly unique datasets to represent this mountainous terrain, combining centuries of cartographic excellence with modern vector tile technology.
            </div>
        </section>

        <section id="position-2">
            <div class="textbox">
                <strong>Modern Mapping</strong>
                Approaching Interlaken, this 3D visualization showcases the result of MapTiler's partnership with SwissTopo. The authoritative government data has been transformed into interactive vector maps while preserving the hand-crafted details that make Swiss maps special.
            </div>
        </section>

        <section id="position-3" style="margin-bottom: 150vh;">
            <div class="textbox">
                <strong>Explore Switzerland</strong>
                From this bird's eye view, you can see the full scope of Swiss topographic excellence. The map beneath you represents the highest standards of accuracy and beauty in digital cartography — ready for you to explore.
            </div>
        </section>
    </div>

    {#if showExploreMessage}
        <div class="explore-message">
            <div class="explore-message-content">
                Explore the map and data
            </div>
        </div>
    {/if}
</main>

<style>
    main {
        width: 100%;
        height: 100%;
    }

    .map-interaction-blocker {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        z-index: 100;
        pointer-events: all;
        /* Invisible - just blocks interactions */
    }

    .scrollytelling {
        display: grid;
        grid-template-columns: 40vw;
        justify-content: left;
        padding-left: 5vw;
        gap: 90vh;
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        padding-top: 70vh;
        box-sizing: border-box;
        z-index: 200;
        pointer-events: none;
    }

    .textbox {
        text-align: left;
        padding: 1.5rem;
        font-size: 1rem;
        font-weight: normal;
        color: #3a2a1a;
        background-color: rgba(245, 235, 220, 0.95);
        line-height: 150%;
        border-radius: 8px;
        max-width: 30vw;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(10px);
        pointer-events: auto;
        transform: translateZ(0);
        will-change: transform;
        border: 1px solid rgba(139, 69, 19, 0.2);
    }

    .textbox strong {
        display: block;
        color: #8b1a1a;
        font-weight: 700;
        font-size: 1.3rem;
        margin-bottom: 0.8rem;
        letter-spacing: 0.02em;
        text-transform: uppercase;
    }

    .explore-message {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        pointer-events: none;
        animation: exploreMessageFadeIn 0.5s ease-out forwards;
    }

    .explore-message-content {
        background-color: rgba(245, 235, 220, 0.95);
        color: #3a2a1a;
        padding: 24px 40px;
        border-radius: 12px;
        font-size: 1.5rem;
        font-weight: 700;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        text-align: center;
        animation: exploreContentScale 0.5s ease-out forwards;
        border: 1px solid rgba(139, 69, 19, 0.2);
        letter-spacing: 0.02em;
    }

    @keyframes exploreMessageFadeIn {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    @keyframes exploreContentScale {
        0% {
            transform: scale(0.95);
        }
        100% {
            transform: scale(1);
        }
    }

    @media (max-width: 768px) {
        .scrollytelling {
            grid-template-columns: 90vw;
            justify-content: center;
            padding-left: 0vw;
        }

        .textbox {
            font-size: 0.95rem;
            max-width: 90vw;
            padding: 1.2rem;
        }

        .textbox strong {
            font-size: 1.1rem;
            margin-bottom: 0.6rem;
        }

        .explore-message-content {
            font-size: 1.2rem;
            padding: 20px 30px;
        }
    }
</style>
