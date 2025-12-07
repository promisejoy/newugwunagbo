        // Enhanced Forum functionality with commenting features
        class ForumManager {
            constructor() {
                this.topics = JSON.parse(localStorage.getItem('forum_topics')) || [];
                this.replies = JSON.parse(localStorage.getItem('forum_replies')) || [];
                this.currentView = 'list'; // 'list' or 'topic'
                this.currentTopicId = null;
                this.replyingTo = null; // For nested replies
                
                this.initializeEventListeners();
                this.loadTopics();
                this.updateStats();
            }

            initializeEventListeners() {
                // New topic modal
                const newTopicBtn = document.getElementById('newTopicBtn');
                const newTopicModal = document.getElementById('newTopicModal');
                const cancelTopic = document.getElementById('cancelTopic');
                const topicForm = document.getElementById('topicForm');

                if (newTopicBtn) {
                    newTopicBtn.addEventListener('click', () => {
                        newTopicModal.classList.add('active');
                    });
                }

                if (cancelTopic) {
                    cancelTopic.addEventListener('click', () => {
                        newTopicModal.classList.remove('active');
                        topicForm.reset();
                    });
                }

                if (topicForm) {
                    topicForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        this.createNewTopic();
                    });
                }

                // Close modal when clicking outside
                if (newTopicModal) {
                    newTopicModal.addEventListener('click', (e) => {
                        if (e.target === newTopicModal) {
                            newTopicModal.classList.remove('active');
                            topicForm.reset();
                        }
                    });
                }

                // Search functionality
                const searchBtn = document.getElementById('searchBtn');
                const searchInput = document.getElementById('searchTopics');

                if (searchBtn && searchInput) {
                    searchBtn.addEventListener('click', () => this.searchTopics(searchInput.value));
                    searchInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            this.searchTopics(searchInput.value);
                        }
                    });
                }
            }

            createNewTopic() {
                const title = document.getElementById('topicTitle').value;
                const category = document.getElementById('topicCategory').value;
                const author = document.getElementById('authorName').value || 'Anonymous';
                const content = document.getElementById('topicContent').value;

                if (!title || !category || !content) {
                    alert('Please fill in all required fields');
                    return;
                }

                const newTopic = {
                    id: Date.now().toString(),
                    title: title,
                    category: category,
                    author: author,
                    content: content,
                    createdAt: new Date().toISOString(),
                    views: 0,
                    replyCount: 0,
                    lastActivity: new Date().toISOString()
                };

                this.topics.unshift(newTopic);
                this.saveToLocalStorage();
                this.loadTopics();
                this.updateStats();

                // Close modal and reset form
                document.getElementById('newTopicModal').classList.remove('active');
                document.getElementById('topicForm').reset();

                // Show success message
                this.showMessage('Discussion started successfully!', 'success');
            }

            loadTopics(filteredTopics = null) {
                const topicsList = document.getElementById('topicsList');
                const topicsToDisplay = filteredTopics || this.topics;

                if (topicsToDisplay.length === 0) {
                    topicsList.innerHTML = `
                        <div class="no-topics">
                            <i class="fas fa-comments"></i>
                            <h3>No discussions found</h3>
                            <p>Be the first to start a discussion!</p>
                        </div>
                    `;
                    return;
                }

                topicsList.innerHTML = topicsToDisplay.map(topic => `
                    <div class="topic-item" data-topic-id="${topic.id}">
                        <div class="topic-icon">
                            <i class="fas fa-comments"></i>
                        </div>
                        <div class="topic-content">
                            <a href="#" class="topic-title view-topic">${this.escapeHtml(topic.title)}</a>
                            <div class="topic-meta">
                                <span><i class="fas fa-user"></i> By ${this.escapeHtml(topic.author)}</span>
                                <span><i class="fas fa-clock"></i> ${this.formatDate(topic.createdAt)}</span>
                                <span class="topic-category">${topic.category}</span>
                            </div>
                            <p class="topic-excerpt">${this.escapeHtml(topic.content.substring(0, 150))}${topic.content.length > 150 ? '...' : ''}</p>
                        </div>
                        <div class="topic-stats">
                            <div class="topic-stat">
                                <i class="fas fa-eye"></i>
                                <span>${topic.views}</span>
                            </div>
                            <div class="topic-stat">
                                <i class="fas fa-comment"></i>
                                <span>${topic.replyCount}</span>
                            </div>
                        </div>
                    </div>
                `).join('');

                // Add event listeners to topic titles
                document.querySelectorAll('.view-topic').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const topicId = e.target.closest('.topic-item').dataset.topicId;
                        this.viewTopic(topicId);
                    });
                });

                // Add event listeners to entire topic items
                document.querySelectorAll('.topic-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        if (!e.target.classList.contains('view-topic') && !e.target.closest('.view-topic')) {
                            const topicId = item.dataset.topicId;
                            this.viewTopic(topicId);
                        }
                    });
                });
            }

            viewTopic(topicId) {
                const topic = this.topics.find(t => t.id === topicId);
                if (!topic) return;

                // Update views
                topic.views++;
                this.saveToLocalStorage();

                const topicReplies = this.replies.filter(reply => reply.topicId === topicId && !reply.parentReplyId);
                const nestedReplies = this.replies.filter(reply => reply.parentReplyId);

                const topicView = `
                    <button class="back-to-forum" id="backToForum">
                        <i class="fas fa-arrow-left"></i> Back to Discussions
                    </button>

                    <div class="topic-detail-container">
                        <div class="topic-header">
                            <h1>${this.escapeHtml(topic.title)}</h1>
                            <div class="topic-meta-info">
                                <span><i class="fas fa-user"></i> Started by ${this.escapeHtml(topic.author)}</span>
                                <span><i class="fas fa-clock"></i> ${this.formatDate(topic.createdAt)}</span>
                                <span class="topic-category">${topic.category}</span>
                                <span><i class="fas fa-eye"></i> ${topic.views} views</span>
                            </div>
                        </div>
                        
                        <div class="topic-content">
                            <p>${this.formatContent(topic.content)}</p>
                        </div>

                        <div class="replies-section">
                            <h3>
                                <i class="fas fa-comments"></i>
                                Comments
                                <span class="replies-count">${topicReplies.length}</span>
                            </h3>
                            
                            <div class="reply-form">
                                <h4><i class="fas fa-reply"></i> Post a Comment</h4>
                                <form id="replyForm">
                                    <div class="form-group">
                                        <label for="replyAuthor">Your Name (Optional)</label>
                                        <input type="text" id="replyAuthor" placeholder="How should we call you?">
                                    </div>
                                    <div class="form-group">
                                        <label for="replyContent">Your Comment *</label>
                                        <textarea id="replyContent" required placeholder="Share your thoughts..."></textarea>
                                    </div>
                                    <div class="form-actions">
                                        <button type="submit" class="btn btn-primary">Post Comment</button>
                                    </div>
                                </form>
                            </div>

                            <div id="repliesList">
                                ${topicReplies.length > 0 ? 
                                    this.renderReplies(topicReplies, nestedReplies) : 
                                    '<div class="no-replies"><i class="fas fa-comment-slash"></i><p>No comments yet. Be the first to comment!</p></div>'
                                }
                            </div>
                        </div>
                    </div>
                `;

                document.querySelector('.forum-container').innerHTML = topicView;

                this.currentView = 'topic';
                this.currentTopicId = topicId;
                this.replyingTo = null;

                // Add event listeners for the reply form
                document.getElementById('replyForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.postReply();
                });

                document.getElementById('backToForum').addEventListener('click', () => {
                    this.showTopicList();
                });

                // Add event listeners for nested reply forms
                this.initializeNestedReplyListeners();
            }

            renderReplies(replies, nestedReplies) {
                return replies.map(reply => {
                    const replyNestedReplies = nestedReplies.filter(nested => nested.parentReplyId === reply.id);
                    
                    return `
                        <div class="reply-item" data-reply-id="${reply.id}">
                            <div class="reply-header">
                                <div class="reply-author">
                                    <i class="fas fa-user-circle"></i>
                                    ${this.escapeHtml(reply.author)}
                                </div>
                                <div class="reply-date">
                                    ${this.formatDate(reply.createdAt)}
                                </div>
                            </div>
                            <div class="reply-content">
                                <p>${this.formatContent(reply.content)}</p>
                            </div>
                            <div class="reply-actions">
                                <button class="like-btn" data-reply-id="${reply.id}">
                                    <i class="fas fa-thumbs-up"></i> Like
                                </button>
                                <button class="reply-to-reply-btn" data-reply-id="${reply.id}">
                                    <i class="fas fa-reply"></i> Reply
                                </button>
                            </div>

                            ${replyNestedReplies.length > 0 ? `
                                <div class="nested-replies">
                                    ${this.renderReplies(replyNestedReplies, nestedReplies)}
                                </div>
                            ` : ''}

                            <div class="nested-reply-form" id="nestedReplyForm-${reply.id}" style="display: none;">
                                <form class="nested-reply-form-inner">
                                    <div class="form-group">
                                        <label for="nestedReplyAuthor-${reply.id}">Your Name (Optional)</label>
                                        <input type="text" id="nestedReplyAuthor-${reply.id}" placeholder="Your name">
                                    </div>
                                    <div class="form-group">
                                        <label for="nestedReplyContent-${reply.id}">Your Reply *</label>
                                        <textarea id="nestedReplyContent-${reply.id}" required placeholder="Write your reply..."></textarea>
                                    </div>
                                    <div class="nested-reply-actions">
                                        <button type="button" class="btn btn-secondary cancel-nested-reply" data-reply-id="${reply.id}">Cancel</button>
                                        <button type="submit" class="btn btn-primary">Post Reply</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            initializeNestedReplyListeners() {
                // Like buttons
                document.querySelectorAll('.like-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const replyId = e.target.closest('.like-btn').dataset.replyId;
                        this.toggleLike(replyId);
                    });
                });

                // Reply to reply buttons
                document.querySelectorAll('.reply-to-reply-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const replyId = e.target.closest('.reply-to-reply-btn').dataset.replyId;
                        this.showNestedReplyForm(replyId);
                    });
                });

                // Nested reply form submissions
                document.querySelectorAll('.nested-reply-form-inner').forEach(form => {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const replyId = e.target.closest('.nested-reply-form').id.split('-')[2];
                        this.postNestedReply(replyId);
                    });
                });

                // Cancel nested reply buttons
                document.querySelectorAll('.cancel-nested-reply').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const replyId = e.target.dataset.replyId;
                        this.hideNestedReplyForm(replyId);
                    });
                });
            }

            showNestedReplyForm(replyId) {
                // Hide any other open nested reply forms
                document.querySelectorAll('.nested-reply-form').forEach(form => {
                    form.style.display = 'none';
                });
                
                const nestedForm = document.getElementById(`nestedReplyForm-${replyId}`);
                if (nestedForm) {
                    nestedForm.style.display = 'block';
                    nestedForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            hideNestedReplyForm(replyId) {
                const nestedForm = document.getElementById(`nestedReplyForm-${replyId}`);
                if (nestedForm) {
                    nestedForm.style.display = 'none';
                    // Clear form
                    const form = nestedForm.querySelector('.nested-reply-form-inner');
                    form.reset();
                }
            }

            postReply() {
                const author = document.getElementById('replyAuthor').value || 'Anonymous';
                const content = document.getElementById('replyContent').value;

                if (!content) {
                    alert('Please enter your comment');
                    return;
                }

                const newReply = {
                    id: Date.now().toString(),
                    topicId: this.currentTopicId,
                    author: author,
                    content: content,
                    createdAt: new Date().toISOString(),
                    parentReplyId: null, // Top-level reply
                    likes: 0
                };

                this.replies.push(newReply);

                // Update topic reply count and last activity
                const topic = this.topics.find(t => t.id === this.currentTopicId);
                if (topic) {
                    topic.replyCount++;
                    topic.lastActivity = new Date().toISOString();
                }

                this.saveToLocalStorage();
                this.viewTopic(this.currentTopicId); // Refresh the view
                this.showMessage('Comment posted successfully!', 'success');
                
                // Clear the form
                document.getElementById('replyForm').reset();
            }

            postNestedReply(parentReplyId) {
                const authorInput = document.getElementById(`nestedReplyAuthor-${parentReplyId}`);
                const contentInput = document.getElementById(`nestedReplyContent-${parentReplyId}`);
                
                const author = authorInput ? authorInput.value || 'Anonymous' : 'Anonymous';
                const content = contentInput ? contentInput.value : '';

                if (!content) {
                    alert('Please enter your reply');
                    return;
                }

                const newReply = {
                    id: Date.now().toString(),
                    topicId: this.currentTopicId,
                    author: author,
                    content: content,
                    createdAt: new Date().toISOString(),
                    parentReplyId: parentReplyId,
                    likes: 0
                };

                this.replies.push(newReply);

                // Update topic last activity
                const topic = this.topics.find(t => t.id === this.currentTopicId);
                if (topic) {
                    topic.lastActivity = new Date().toISOString();
                }

                this.saveToLocalStorage();
                this.viewTopic(this.currentTopicId); // Refresh the view
                this.showMessage('Reply posted successfully!', 'success');
            }

            toggleLike(replyId) {
                const reply = this.replies.find(r => r.id === replyId);
                if (reply) {
                    if (!reply.likes) reply.likes = 0;
                    reply.likes++;
                    this.saveToLocalStorage();
                    
                    const likeBtn = document.querySelector(`.like-btn[data-reply-id="${replyId}"]`);
                    if (likeBtn) {
                        likeBtn.classList.add('liked');
                        likeBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> Liked (${reply.likes})`;
                    }
                    
                    this.showMessage('Thanks for your feedback!', 'success');
                }
            }

            showTopicList() {
                this.currentView = 'list';
                this.currentTopicId = null;
                this.replyingTo = null;
                
                // Reload the page to show the topic list
                window.location.reload();
            }

            searchTopics(query) {
                if (!query.trim()) {
                    this.loadTopics();
                    return;
                }

                const filteredTopics = this.topics.filter(topic => 
                    topic.title.toLowerCase().includes(query.toLowerCase()) ||
                    topic.content.toLowerCase().includes(query.toLowerCase()) ||
                    topic.author.toLowerCase().includes(query.toLowerCase()) ||
                    topic.category.toLowerCase().includes(query.toLowerCase())
                );

                this.loadTopics(filteredTopics);
            }

            updateStats() {
                const totalTopics = this.topics.length;
                const totalReplies = this.replies.length;
                
                // Calculate active users (users who posted in last 24 hours)
                const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const activeUsers = new Set([
                    ...this.topics.filter(t => new Date(t.createdAt) > last24Hours).map(t => t.author),
                    ...this.replies.filter(r => new Date(r.createdAt) > last24Hours).map(r => r.author)
                ]).size;

                document.getElementById('totalTopics').textContent = totalTopics;
                document.getElementById('totalReplies').textContent = totalReplies;
                document.getElementById('activeUsers').textContent = activeUsers;
            }

            saveToLocalStorage() {
                localStorage.setItem('forum_topics', JSON.stringify(this.topics));
                localStorage.setItem('forum_replies', JSON.stringify(this.replies));
            }

            formatDate(dateString) {
                const date = new Date(dateString);
                const now = new Date();
                const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

                if (diffInHours < 1) {
                    return 'Just now';
                } else if (diffInHours < 24) {
                    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
                } else {
                    return date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            }

            formatContent(content) {
                // Convert line breaks to <br> tags and escape HTML
                return this.escapeHtml(content).replace(/\n/g, '<br>');
            }

            escapeHtml(unsafe) {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }

            showMessage(message, type = 'info') {
                // Create a simple notification
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    background: ${type === 'success' ? '#10b981' : '#3b82f6'};
                    color: white;
                    border-radius: 5px;
                    z-index: 1000;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                `;
                notification.textContent = message;
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }
        }

        // Initialize forum when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new ForumManager();
            
            // Set current year in footer
            document.getElementById('currentYear').textContent = new Date().getFullYear();

            // Mobile menu functionality
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            const navLinks = document.querySelector('.nav-links');

            if (mobileMenuBtn && navLinks) {
                mobileMenuBtn.addEventListener('click', function() {
                    navLinks.classList.toggle('active');
                    // Toggle icon between bars and times
                    const icon = this.querySelector('i');
                    if (icon.classList.contains('fa-bars')) {
                        icon.classList.remove('fa-bars');
                        icon.classList.add('fa-times');
                    } else {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                });
            }

            // Close mobile menu when clicking outside
            document.addEventListener('click', function(event) {
                if (!event.target.closest('nav') && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });

            // Scroll to top functionality
            const scrollToTopBtn = document.getElementById('scrollToTop');
            
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.style.display = 'flex';
                } else {
                    scrollToTopBtn.style.display = 'none';
                }
            });

            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        });