"use strict";
class CustomVideoPlayer {
    constructor(containerId, videoUrl) {
        this.containerId = containerId;
        this.videoUrl = videoUrl;
        this.isSeeking = false;
        this.previousVolume = 1;
        this.validateInputs();
        this.createElements();
        this.setupEventListeners();
        this.addStyles();
    }
    validateInputs() {
        const container = document.getElementById(this.containerId);
        if (!container)
            throw new Error(`Invalid container ID: ${this.containerId}`);
        if (!this.videoUrl)
            throw new Error('Video URL is required.');
    }
    createElements() {
        const container = document.getElementById(this.containerId);
        this.videoElement = this.createVideoElement();
        this.controlsContainer = this.createDiv('controls');
        this.playPauseBtn = this.createButton('fa-solid fa-play', () => this.togglePlay());
        this.skipBackwardBtn = this.createButton('fa-solid fa-backward', () => this.skipTime(-5));
        this.skipForwardBtn = this.createButton('fa-solid fa-forward', () => this.skipTime(5));
        this.progressBar = this.createRangeInput(0, 0, 'progress-bar');
        this.volumeBar = this.createRangeInput(0, 1, 'volume-bar', '0.01', '1');
        this.muteBtn = this.createButton('fa-solid fa-volume-up', () => this.toggleMute());
        this.fullscreenBtn = this.createButton('fa-solid fa-expand', () => this.toggleFullscreen());
        this.currentTimeDisplay = this.createSpan('00:00');
        this.durationDisplay = this.createSpan('00:00');
        const timeContainer = this.createDiv('time-container', [
            this.currentTimeDisplay,
            this.progressBar,
            this.durationDisplay,
        ]);
        this.appendChildren(this.controlsContainer, [
            this.playPauseBtn,
            this.skipBackwardBtn,
            this.skipForwardBtn,
            this.muteBtn,
            this.volumeBar,
            this.fullscreenBtn,
            timeContainer,
        ]);
        this.appendChildren(container, [this.videoElement, this.controlsContainer]);
    }
    setupEventListeners() {
        this.videoElement.addEventListener('timeupdate', () => this.updateProgress());
        this.videoElement.addEventListener('loadedmetadata', () => {
            this.progressBar.max = this.videoElement.duration.toString();
            this.durationDisplay.textContent = this.formatTime(this.videoElement.duration);
        });
        this.progressBar.addEventListener('input', () => {
            this.isSeeking = true;
            this.videoElement.currentTime = +this.progressBar.value;
        });
        this.progressBar.addEventListener('change', () => (this.isSeeking = false));
        this.volumeBar.addEventListener('input', () => (this.videoElement.volume = +this.volumeBar.value));
    }
    togglePlay() {
        if (this.videoElement.paused) {
            this.videoElement.play();
            this.playPauseBtn.firstElementChild.className = 'fa-solid fa-pause';
        }
        else {
            this.videoElement.pause();
            this.playPauseBtn.firstElementChild.className = 'fa-solid fa-play';
        }
    }
    toggleMute() {
        if (this.videoElement.muted) {
            this.videoElement.muted = false;
            this.videoElement.volume = this.previousVolume;
            this.volumeBar.value = this.previousVolume.toString();
            this.muteBtn.firstElementChild.className = 'fa-solid fa-volume-up';
        }
        else {
            // Mute: Store volume and set to 0
            this.previousVolume = this.videoElement.volume;
            this.videoElement.muted = true;
            this.videoElement.volume = 0;
            this.volumeBar.value = '0';
            this.muteBtn.firstElementChild.className = 'fa-solid fa-volume-xmark';
        }
    }
    toggleFullscreen() {
        if (document.fullscreenElement)
            document.exitFullscreen();
        else
            this.videoElement.requestFullscreen();
    }
    skipTime(seconds) {
        this.videoElement.currentTime += seconds;
    }
    updateProgress() {
        if (!this.isSeeking) {
            this.progressBar.value = this.videoElement.currentTime.toString();
            this.currentTimeDisplay.textContent = this.formatTime(this.videoElement.currentTime);
        }
    }
    formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${(sec < 10 ? '0' : '') + sec}`;
    }
    // 🔹 Utility Functions 🔹 //
    createVideoElement() {
        const video = document.createElement('video');
        video.src = this.videoUrl;
        video.classList.add('video');
        video.style.width = '100%';
        return video;
    }
    createButton(iconClass, onClick) {
        const button = document.createElement('button');
        const icon = document.createElement('i');
        icon.className = iconClass;
        button.appendChild(icon);
        button.classList.add('control-btn');
        button.addEventListener('click', onClick);
        return button;
    }
    createRangeInput(min, max, className, step = '1', value = '0') {
        const input = document.createElement('input');
        input.type = 'range';
        input.min = min.toString();
        input.max = max.toString();
        input.step = step;
        input.value = value;
        input.classList.add(className);
        return input;
    }
    createSpan(text) {
        const span = document.createElement('span');
        span.textContent = text;
        span.style.color = '#fff';
        return span;
    }
    createDiv(className, children = []) {
        const div = document.createElement('div');
        div.classList.add(className);
        this.appendChildren(div, children);
        return div;
    }
    appendChildren(parent, children) {
        children.forEach(child => parent.appendChild(child));
    }
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
        #${this.containerId} {
            max-width: 600px;
            margin: 0 auto;
            position: relative;
            border-radius: 10px;
            overflow: hidden;
            background: black;
        }
        .video {
            display: block;
            width: 100%;
            height: auto;
        }
        .controls {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(67, 75, 117, 0.7);
            padding: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        .control-btn {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .time-container {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-grow: 1;
        }
        .progress-bar {
          -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 6px;
            background: rgba(67, 75, 117, 0.7);  
            border-radius: 5px;
            outline: none;
            cursor: pointer;
        }
      
        .volume-bar {
            width: 80px;
            height: 5px;
            border-radius: 5px;
            cursor: pointer;
            transition: height 0.2s;
            outline: none;
        }
        
        .time-container span {
            color: white;
            font-size: 14px;
        }
    `;
        document.head.appendChild(style);
    }
}
new CustomVideoPlayer("video1", "../videos/Nice-1.mp4");
new CustomVideoPlayer("video2", "../videos/First-1.mp4");
