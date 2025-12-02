<script>
    import { onMount } from 'svelte';
    import { link } from 'svelte-spa-router';
    import Map from '../components/Map.svelte';

    let showMap = false;
    let mapLoaded = false;
    let loadingProgress = 0;
    let loadingStatus = 'Loading...';
    let currentPosition = 'position-0';
    let minimumLoadTimeElapsed = false;
    let blockMapInteraction = true;
    let mapComponent;

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

    onMount(() => {
        if (typeof window !== 'undefined') {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual';
            }
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }

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
        <Map bind:this={mapComponent} on:mapStatus={handleMapStatus} mode="storytelling" />
    {/if}

    <!-- Back button to return to home -->
    <a href="#/" use:link class="back-button">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Back to Map</span>
    </a>

    <!-- Blocking overlay - prevents map interaction during scrolly -->
    {#if blockMapInteraction}
        <div class="map-interaction-blocker"></div>
    {/if}

    <div class="scrollytelling">
        <section id="position-0" class="active">
            <div class="textbox">
                <strong>The Challenge Begins</strong>
                <p class="highlight-text">
                    26 cantons. One day. Only public transportation.
                </p>
                <img src="map-on-train.jpg" alt="Planning the route on the train" class="textbox-image" />
                Starting before dawn in French-speaking Valais, the canton challenge begins. The route is planned down to the minute—every connection timed to the Taktfahrplan's pulse. Miss one transfer, and the whole day unravels.
            </div>
        </section>

        <section id="position-1">
            <div class="textbox">
                <strong>Across the Plateau</strong>
                <img src="community-3.jpeg" alt="Meeting local guides" class="textbox-image" />
                Locals from the community join along the way, helping navigate tight transfers and sharing the unspoken rules of Swiss trains. "German trains are always late," one explains. "We don't let them in—we have backup trains waiting at Basel just in case."
            </div>
        </section>

        <section id="position-2">
            <div class="textbox">
                <strong>Gateway to the Alps</strong>
                Lucerne marks the transition. Ahead: the Alps. The railways here began as a way for Victorian British tourists to witness the mountains. That tourism funded increasingly ambitious infrastructure—gondolas, cog railways, tunnels carved inside peaks themselves.
                <img src="eigergletscher.jpg" alt="At Eigergletscher station" class="textbox-image" />
            </div>
        </section>

        <section id="position-3">
            <div class="textbox">
                <strong>Under the Alps</strong>
                Traveling at 200 km/h through the Gotthard Base Tunnel—57km of engineering beneath 2.5km of rock. The original tunnel took 15 billion francs and dozens of lives to build. It was called their "national spine," the rail equivalent of the Golden Gate Bridge or Great Wall. This is what united Switzerland.
                <img src="GOTTHARD.jpg" alt="Inside the Gotthard tunnel" class="textbox-image" />
            </div>
        </section>

        <section id="position-4" style="margin-bottom: 30vh;">
            <div class="textbox">
                <strong>A Country Connected</strong>
                8,000 trains daily. 93% on time. Powered almost entirely by hydroelectric gravity—water falling from these same mountains. The system pulses together every 30 minutes, connecting everywhere to everywhere. It's not just transportation. It's a founding myth made physical.
            </div>
        </section>
    </div>
</main>

<style>
    main {
        width: 100%;
        height: 100%;
    }

    .back-button {
        position: fixed;
        top: 2rem;
        left: 2rem;
        z-index: 600;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.75rem 1.25rem;
        background: rgba(255, 255, 255, 0.95);
        color: var(--swiss-navy);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        font-family: var(--font-body);
        border-radius: 50px;
        box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.08),
            0 8px 20px rgba(20, 58, 82, 0.1);
        backdrop-filter: blur(20px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        border: 2px solid rgba(20, 58, 82, 0.1);
    }

    .back-button:hover {
        background: var(--swiss-navy);
        color: white;
        box-shadow:
            0 4px 12px rgba(20, 58, 82, 0.2),
            0 12px 28px rgba(20, 58, 82, 0.25);
        transform: translateY(-2px);
        border-color: var(--swiss-navy);
    }

    .back-button:active {
        transform: translateY(0);
    }

    .back-button svg {
        transition: transform 0.3s ease;
        stroke-width: 2px;
    }

    .back-button:hover svg {
        transform: translateX(-3px);
    }

    .map-interaction-blocker {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        z-index: 100;
        pointer-events: all;
    }

    @media (max-width: 768px) {
        .back-button {
            top: 1rem;
            left: 1rem;
            padding: 0.7rem 1.2rem;
            font-size: 0.9rem;
        }

        .back-button svg {
            width: 16px;
            height: 16px;
        }
    }
</style>
