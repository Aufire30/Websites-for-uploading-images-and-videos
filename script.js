document.addEventListener('DOMContentLoaded', () => {
    // 页面元素
    const imageDropZone = document.getElementById('imageDropZone');
    const videoDropZone = document.getElementById('videoDropZone');
    const imageFileInput = document.getElementById('imageFileInput');
    const videoFileInput = document.getElementById('videoFileInput');
    const mediaGallery = document.getElementById('mediaGallery');
    const imageModal = document.getElementById('imageModal');
    const videoModal = document.getElementById('videoModal');
    const modalImg = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');
    const closeBtns = document.querySelectorAll('.close-btn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    // 管理员相关元素
    const adminPanel = document.getElementById('adminPanel');
    const adminLogin = document.getElementById('adminLogin');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const loginModal = document.getElementById('loginModal');
    const adminPassword = document.getElementById('adminPassword');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const loginCancelBtn = document.getElementById('loginCancelBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // 管理员密码 - 实际应用中应使用更安全的方式存储和验证
    const ADMIN_PASSWORD = '258879226';
    
    // 管理员模式状态
    let isAdminMode = false;

    // 从localStorage加载已保存的媒体
    loadMedia();

    // 上传标签页切换事件
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有标签的active类
            tabBtns.forEach(b => b.classList.remove('active'));
            // 添加当前标签的active类
            btn.classList.add('active');
            
            const tabType = btn.dataset.tab;
            
            // 隐藏所有上传区域
            imageDropZone.style.display = 'none';
            videoDropZone.style.display = 'none';
            
            // 显示选中的上传区域
            if (tabType === 'image') {
                imageDropZone.style.display = 'block';
            } else if (tabType === 'video') {
                videoDropZone.style.display = 'block';
            }
        });
    });

    // 点击上传区域触发文件选择
    imageDropZone.addEventListener('click', () => {
        imageFileInput.click();
    });
    
    videoDropZone.addEventListener('click', () => {
        videoFileInput.click();
    });

    // 处理文件选择
    imageFileInput.addEventListener('change', (e) => handleFiles(e, 'image'));
    videoFileInput.addEventListener('change', (e) => handleFiles(e, 'video'));

    // 处理图片拖放
    imageDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageDropZone.style.borderColor = '#2980b9';
    });

    imageDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        imageDropZone.style.borderColor = '#3498db';
    });

    imageDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        imageDropZone.style.borderColor = '#3498db';
        const files = e.dataTransfer.files;
        handleFiles({ target: { files } }, 'image');
    });
    
    // 处理视频拖放
    videoDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        videoDropZone.style.borderColor = '#2980b9';
    });

    videoDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        videoDropZone.style.borderColor = '#3498db';
    });

    videoDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        videoDropZone.style.borderColor = '#3498db';
        const files = e.dataTransfer.files;
        handleFiles({ target: { files } }, 'video');
    });

    // 关闭模态框
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            imageModal.style.display = 'none';
            videoModal.style.display = 'none';
            
            // 暂停视频
            modalVideo.pause();
        });
    });

    // 点击模态框背景关闭
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });
    
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            videoModal.style.display = 'none';
            modalVideo.pause();
        }
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (imageModal.style.display === 'block') {
                imageModal.style.display = 'none';
            }
            if (videoModal.style.display === 'block') {
                videoModal.style.display = 'none';
                modalVideo.pause();
            }
            if (loginModal.style.display === 'flex') {
                loginModal.style.display = 'none';
            }
        }
    });

    // 清除所有媒体按钮事件
    clearAllBtn.addEventListener('click', clearAllMedia);
    
    // 管理员登录按钮事件
    adminLoginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
        adminPassword.focus();
    });
    
    // 登录提交按钮事件
    loginSubmitBtn.addEventListener('click', () => {
        checkAdminPassword();
    });
    
    // 回车键提交密码
    adminPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkAdminPassword();
        }
    });
    
    // 登录取消按钮事件
    loginCancelBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        adminPassword.value = '';
    });
    
    // 退出管理模式按钮事件
    logoutBtn.addEventListener('click', () => {
        toggleAdminMode(false);
    });

    function handleFiles(e, type) {
        const files = e.target.files;
        for (const file of files) {
            if (type === 'image' && file.type.startsWith('image/')) {
                processImageFile(file);
            } else if (type === 'video' && file.type.startsWith('video/')) {
                processVideoFile(file);
            }
        }
    }
    
    function processImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const mediaItem = {
                type: 'image',
                data: e.target.result,
                timestamp: new Date().getTime()
            };
            saveMedia(mediaItem);
            displayMedia(mediaItem);
        };
        reader.readAsDataURL(file);
    }
    
    function processVideoFile(file) {
        // 创建视频元素以获取元数据
        const video = document.createElement('video');
        
        // 为视频创建Blob URL
        const videoURL = URL.createObjectURL(file);
        video.src = videoURL;
        
        // 当元数据加载完成时
        video.onloadedmetadata = () => {
            // 释放Blob URL
            URL.revokeObjectURL(videoURL);
            
            // 获取视频时长
            const duration = video.duration;
            
            // 创建视频缩略图
            generateVideoThumbnail(file, (thumbnailData) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const mediaItem = {
                        type: 'video',
                        data: e.target.result,
                        thumbnail: thumbnailData,
                        duration: duration,
                        timestamp: new Date().getTime()
                    };
                    saveMedia(mediaItem);
                    displayMedia(mediaItem);
                };
                reader.readAsDataURL(file);
            });
        };
    }
    
    function generateVideoThumbnail(videoFile, callback) {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置视频文件为源
        video.src = URL.createObjectURL(videoFile);
        
        // 设置视频为自动播放但静音
        video.autoplay = false;
        video.muted = true;
        
        // 当视频可以播放时
        video.onloadeddata = () => {
            // 暂停在第一帧
            video.currentTime = 1; // 跳到第1秒生成略缩图
            
            video.onseeked = () => {
                // 设置画布尺寸
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // 绘制当前帧到画布
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // 将画布内容转换为数据URL
                const thumbnailData = canvas.toDataURL('image/jpeg');
                
                // 释放Blob URL
                URL.revokeObjectURL(video.src);
                
                // 回调返回缩略图数据
                callback(thumbnailData);
            };
        };
    }

    function saveMedia(mediaItem) {
        let media = JSON.parse(localStorage.getItem('media') || '[]');
        media.push(mediaItem);
        localStorage.setItem('media', JSON.stringify(media));
    }

    function loadMedia() {
        const media = JSON.parse(localStorage.getItem('media') || '[]');
        // 按时间戳排序，最新的在前面
        media.sort((a, b) => b.timestamp - a.timestamp).forEach(mediaItem => displayMedia(mediaItem));
    }

    function displayMedia(mediaItem) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        if (mediaItem.type === 'image') {
            displayImage(mediaItem, galleryItem);
        } else if (mediaItem.type === 'video') {
            displayVideo(mediaItem, galleryItem);
        }
        
        // 只在管理员模式下添加删除按钮
        if (isAdminMode) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.onclick = (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                deleteMedia(mediaItem);
                galleryItem.remove();
            };
            galleryItem.appendChild(deleteBtn);
        }

        mediaGallery.appendChild(galleryItem);
    }
    
    function displayImage(mediaItem, galleryItem) {
        const img = document.createElement('img');
        img.src = mediaItem.data;
        img.alt = '浏览图片';

        // 添加点击放大功能
        img.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            imageModal.style.display = 'block';
            modalImg.src = mediaItem.data;
        });

        galleryItem.appendChild(img);
    }
    
    function displayVideo(mediaItem, galleryItem) {
        galleryItem.classList.add('video-item');
        
        // 添加缩略图
        const thumbnail = document.createElement('img');
        thumbnail.src = mediaItem.thumbnail;
        thumbnail.alt = '视频缩略图';
        thumbnail.className = 'thumbnail';
        
        // 添加视频时长标签
        const durationLabel = document.createElement('div');
        durationLabel.className = 'video-duration';
        durationLabel.textContent = formatDuration(mediaItem.duration);
        
        // 添加点击播放功能
        galleryItem.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            videoModal.style.display = 'block';
            modalVideo.src = mediaItem.data;
            modalVideo.play();
        });

        galleryItem.appendChild(thumbnail);
        galleryItem.appendChild(durationLabel);
    }
    
    function formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function deleteMedia(mediaItem) {
        let media = JSON.parse(localStorage.getItem('media') || '[]');
        media = media.filter(item => item.timestamp !== mediaItem.timestamp);
        localStorage.setItem('media', JSON.stringify(media));
    }

    // 清除所有媒体
    function clearAllMedia() {
        // 显示确认对话框
        if (confirm('确定要清除所有媒体文件吗？此操作不可恢复。')) {
            // 清除localStorage中的媒体数据
            localStorage.removeItem('media');
            // 清空媒体展示区域
            mediaGallery.innerHTML = '';
        }
    }
    
    // 检查管理员密码
    function checkAdminPassword() {
        if (adminPassword.value === ADMIN_PASSWORD) {
            toggleAdminMode(true);
            loginModal.style.display = 'none';
            adminPassword.value = '';
        } else {
            alert('密码错误！');
        }
    }
    
    // 切换管理员模式
    function toggleAdminMode(enable) {
        isAdminMode = enable;
        
        if (enable) {
            adminPanel.style.display = 'block';
            adminLogin.style.display = 'none';
        } else {
            adminPanel.style.display = 'none';
            adminLogin.style.display = 'flex';
        }
        
        // 重新加载媒体以更新删除按钮的显示状态
        mediaGallery.innerHTML = '';
        loadMedia();
    }
    
    // 兼容旧版本数据
    function migrateOldData() {
        const oldImages = JSON.parse(localStorage.getItem('images') || '[]');
        if (oldImages.length > 0) {
            let media = JSON.parse(localStorage.getItem('media') || '[]');
            
            // 转换旧格式图片数据到新格式
            oldImages.forEach(imageData => {
                const mediaItem = {
                    type: 'image',
                    data: imageData,
                    timestamp: new Date().getTime() - Math.floor(Math.random() * 10000) // 添加随机偏移防止相同时间戳
                };
                media.push(mediaItem);
            });
            
            // 保存转换后的媒体数据
            localStorage.setItem('media', JSON.stringify(media));
            // 清除旧数据
            localStorage.removeItem('images');
        }
    }
    
    // 数据迁移
    migrateOldData();
}); 