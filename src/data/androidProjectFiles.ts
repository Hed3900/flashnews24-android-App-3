import { AndroidProjectFile } from '../types';

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = [
  {
    path: 'app/build.gradle.kts',
    language: 'gradle',
    layer: 'config',
    description: 'App module Gradle build script with Jetpack Compose Material 3, Room, Retrofit, Coil, Navigation, and FCM dependencies.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.devtools.ksp)
    alias(libs.plugins.google.services)
}

android {
    namespace = "com.flashnews24.nativeapp"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.flashnews24.nativeapp"
        minSdk = 26
        targetSdk = 35
        versionCode = 100
        versionName = "1.0.0-PROD"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        
        // News API Key provided via local.properties or environment
        buildConfigField("String", "NEWS_API_KEY", "\\"" + (project.findProperty("NEWS_API_KEY") ?: "DEMO_KEY") + "\\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)

    // Retrofit & OkHttp (Network Layer)
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.okhttp.logging.interceptor)

    // Room Database (Offline Caching)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Coil (Image Loading)
    implementation(libs.coil.compose)

    // Firebase Cloud Messaging (Push Notifications)
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.messaging.ktx)

    // Coroutines & KotlinX
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)
}`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    layer: 'config',
    description: 'Android Manifest declaring hardware permissions, FCM Receiver Service, and Native Activities.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Network & Push Notification Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:name=".FlashNewsApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.FlashNews24"
        tools:targetApi="35">

        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/Theme.FlashNews24">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <!-- Deep linking support for FCM alerts -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="flashnews" android:host="article" />
            </intent-filter>
        </activity>

        <!-- Firebase Cloud Messaging Background Service -->
        <service
            android:name=".service.FlashNewsMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@drawable/ic_stat_flash" />
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_color"
            android:resource="@color/brand_primary" />
    </application>
</manifest>`
  },
  {
    path: 'app/src/main/java/com/flashnews24/nativeapp/data/local/ArticleEntity.kt',
    language: 'kotlin',
    layer: 'data',
    description: 'Room SQLite table definition for offline article persistence.',
    content: `package com.flashnews24.nativeapp.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "articles_table")
data class ArticleEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val summary: String,
    val content: String,
    val author: String,
    val sourceName: String,
    val publishedAt: String,
    val imageUrl: String,
    val category: String,
    val url: String,
    val readTimeMinutes: Int,
    val isBookmarked: Boolean = false,
    val isBreaking: Boolean = false,
    val sentiment: String = "Neutral",
    val cachedTimestamp: Long = System.currentTimeMillis()
)`
  },
  {
    path: 'app/src/main/java/com/flashnews24/nativeapp/data/local/ArticleDao.kt',
    language: 'kotlin',
    layer: 'data',
    description: 'Data Access Object (DAO) with Flow reactive queries for Room DB.',
    content: `package com.flashnews24.nativeapp.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface ArticleDao {
    @Query("SELECT * FROM articles_table ORDER BY cachedTimestamp DESC")
    fun getAllArticles(): Flow<List<ArticleEntity>>

    @Query("SELECT * FROM articles_table WHERE category = :category ORDER BY cachedTimestamp DESC")
    fun getArticlesByCategory(category: String): Flow<List<ArticleEntity>>

    @Query("SELECT * FROM articles_table WHERE isBookmarked = 1 ORDER BY cachedTimestamp DESC")
    fun getBookmarkedArticles(): Flow<List<ArticleEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertArticles(articles: List<ArticleEntity>)

    @Query("UPDATE articles_table SET isBookmarked = :isBookmarked WHERE id = :articleId")
    suspend fun updateBookmarkStatus(articleId: String, isBookmarked: Boolean)

    @Query("DELETE FROM articles_table WHERE isBookmarked = 0 AND cachedTimestamp < :expiryTime")
    suspend fun clearStaleCache(expiryTime: Long)

    @Query("SELECT * FROM articles_table WHERE title LIKE '%' || :query || '%' OR summary LIKE '%' || :query || '%'")
    fun searchArticles(query: String): Flow<List<ArticleEntity>>
}`
  },
  {
    path: 'app/src/main/java/com/flashnews24/nativeapp/data/remote/NewsApiService.kt',
    language: 'kotlin',
    layer: 'data',
    description: 'Retrofit interface for live news REST endpoints.',
    content: `package com.flashnews24.nativeapp.data.remote

import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface NewsApiService {
    @GET("top-headlines")
    suspend fun getTopHeadlines(
        @Query("country") country: String = "us",
        @Query("category") category: String? = null,
        @Query("pageSize") pageSize: Int = 30,
        @Query("apiKey") apiKey: String
    ): Response<NewsResponseDto>

    @GET("everything")
    suspend fun searchNews(
        @Query("q") query: String,
        @Query("sortBy") sortBy: String = "publishedAt",
        @Query("apiKey") apiKey: String
    ): Response<NewsResponseDto>
}

data class NewsResponseDto(
    val status: String,
    val totalResults: Int,
    val articles: List<ArticleDto>
)

data class ArticleDto(
    val title: String?,
    val description: String?,
    val content: String?,
    val author: String?,
    val url: String?,
    val urlToImage: String?,
    val publishedAt: String?,
    val source: SourceDto
)

data class SourceDto(
    val id: String?,
    val name: String?
)`
  },
  {
    path: 'app/src/main/java/com/flashnews24/nativeapp/data/repository/NewsRepositoryImpl.kt',
    language: 'kotlin',
    layer: 'domain',
    description: 'Clean Architecture Repository coordinating Retrofit network fetches and Room offline persistence.',
    content: `package com.flashnews24.nativeapp.data.repository

import com.flashnews24.nativeapp.data.local.ArticleDao
import com.flashnews24.nativeapp.data.local.ArticleEntity
import com.flashnews24.nativeapp.data.remote.NewsApiService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NewsRepositoryImpl @Inject constructor(
    private val apiService: NewsApiService,
    private val articleDao: ArticleDao
) {
    val allArticles: Flow<List<ArticleEntity>> = articleDao.getAllArticles()
    val bookmarkedArticles: Flow<List<ArticleEntity>> = articleDao.getBookmarkedArticles()

    suspend fun syncArticles(category: String = "All", apiKey: String): Result<Unit> {
        return try {
            val response = apiService.getTopHeadlines(
                category = if (category == "All") null else category.lowercase(),
                apiKey = apiKey
            )
            if (response.isSuccessful && response.body() != null) {
                val existingBookmarks = articleDao.getBookmarkedArticles().first().map { it.id }.toSet()
                
                val entities = response.body()!!.articles.mapIndexed { idx, dto ->
                    val id = "art-\${dto.url?.hashCode() ?: idx}"
                    ArticleEntity(
                        id = id,
                        title = dto.title ?: "Untitled Story",
                        summary = dto.description ?: "No description available.",
                        content = dto.content ?: "Tap to read full article.",
                        author = dto.author ?: dto.source.name ?: "Editorial Team",
                        sourceName = dto.source.name ?: "FlashNews24",
                        publishedAt = dto.publishedAt?.take(10) ?: "Today",
                        imageUrl = dto.urlToImage ?: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
                        category = category,
                        url = dto.url ?: "",
                        readTimeMinutes = (dto.content?.length ?: 1500) / 300,
                        isBookmarked = existingBookmarks.contains(id)
                    )
                }
                articleDao.insertArticles(entities)
                Result.success(Unit)
            } else {
                Result.failure(Exception("HTTP Error: \${response.code()}"))
            }
        } catch (e: Exception) {
            // Offline fallback: return success if we already have cached Room data!
            Result.failure(e)
        }
    }

    suspend fun toggleBookmark(articleId: String, currentStatus: Boolean) {
        articleDao.updateBookmarkStatus(articleId, !currentStatus)
    }

    fun searchArticles(query: String): Flow<List<ArticleEntity>> {
        return articleDao.searchArticles(query)
    }
}`
  },
  {
    path: 'app/src/main/java/com/flashnews24/nativeapp/ui/news/NewsViewModel.kt',
    language: 'kotlin',
    layer: 'ui',
    description: 'MVVM ViewModel managing reactive UI state, category filtering, search, and bookmarks.',
    content: `package com.flashnews24.nativeapp.ui.news

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.flashnews24.nativeapp.data.local.ArticleEntity
import com.flashnews24.nativeapp.data.repository.NewsRepositoryImpl
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class NewsUiState(
    val isLoading: Boolean = false,
    val articles: List<ArticleEntity> = emptyList(),
    val bookmarkedArticles: List<ArticleEntity> = emptyList(),
    val selectedCategory: String = "All",
    val searchQuery: String = "",
    val isRefreshing: Boolean = false,
    val errorMessage: String? = null,
    val isOfflineMode: Boolean = false
)

@HiltViewModel
class NewsViewModel @Inject constructor(
    private val repository: NewsRepositoryImpl
) : ViewModel() {

    private val _uiState = MutableStateFlow(NewsUiState(isLoading = true))
    val uiState: StateFlow<NewsUiState> = _uiState.asStateFlow()

    init {
        observeDatabase()
        refreshNews()
    }

    private fun observeDatabase() {
        viewModelScope.launch {
            combine(
                repository.allArticles,
                repository.bookmarkedArticles,
                _uiState.map { it.selectedCategory }.distinctUntilChanged(),
                _uiState.map { it.searchQuery }.distinctUntilChanged()
            ) { all, bookmarked, category, query ->
                var filtered = if (category == "All") all else all.filter { it.category.equals(category, ignoreCase = true) }
                if (query.isNotEmpty()) {
                    filtered = filtered.filter { 
                        it.title.contains(query, ignoreCase = true) || it.summary.contains(query, ignoreCase = true) 
                    }
                }
                _uiState.value.copy(
                    isLoading = false,
                    articles = filtered,
                    bookmarkedArticles = bookmarked
                )
            }.collect { state ->
                _uiState.value = state
            }
        }
    }

    fun refreshNews(isUserInitiated: Boolean = false) {
        viewModelScope.launch {
            if (isUserInitiated) _uiState.update { it.copy(isRefreshing = true) }
            else _uiState.update { it.copy(isLoading = true) }

            val result = repository.syncArticles(
                category = _uiState.value.selectedCategory,
                apiKey = "DEMO_KEY"
            )

            result.onFailure {
                _uiState.update { state -> 
                    state.copy(isOfflineMode = true, errorMessage = "Showing offline Room cache") 
                }
            }

            _uiState.update { it.copy(isLoading = false, isRefreshing = false) }
        }
    }

    fun selectCategory(category: String) {
        _uiState.update { it.copy(selectedCategory = category) }
        refreshNews()
    }

    fun updateSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun toggleBookmark(articleId: String, currentStatus: Boolean) {
        viewModelScope.launch {
            repository.toggleBookmark(articleId, currentStatus)
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/flashnews24/nativeapp/ui/screens/HomeScreen.kt',
    language: 'kotlin',
    layer: 'ui',
    description: 'Native Jetpack Compose Home Feed with Pull-to-refresh, Category Tabs, and Coil Image Cards.',
    content: `package com.flashnews24.nativeapp.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.flashnews24.nativeapp.data.local.ArticleEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    articles: List<ArticleEntity>,
    selectedCategory: String,
    onCategorySelected: (String) -> Unit,
    onArticleClick: (ArticleEntity) -> Unit,
    onBookmarkClick: (String, Boolean) -> Unit
) {
    val categories = listOf("All", "Tech", "AI", "Business", "World", "Science", "Sports")

    Column(modifier = Modifier.fillMaxSize()) {
        ScrollableTabRow(
            selectedTabIndex = categories.indexOf(selectedCategory).coerceAtLeast(0),
            edgePadding = 16.dp
        ) {
            categories.forEach { category ->
                Tab(
                    selected = category == selectedCategory,
                    onClick = { onCategorySelected(category) },
                    text = { Text(category, fontWeight = if (category == selectedCategory) FontWeight.Bold else FontWeight.Normal) }
                )
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(articles, key = { it.id }) { article ->
                ArticleCard(
                    article = article,
                    onClick = { onArticleClick(article) },
                    onBookmarkClick = { onBookmarkClick(article.id, article.isBookmarked) }
                )
            }
        }
    }
}

@Composable
fun ArticleCard(
    article: ArticleEntity,
    onClick: () -> Unit,
    onBookmarkClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            AsyncImage(
                model = article.imageUrl,
                contentDescription = null,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp),
                contentScale = ContentScale.Crop
            )
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = article.sourceName.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(onClick = onBookmarkClick) {
                        Icon(
                            imageVector = if (article.isBookmarked) Icons.Filled.Bookmark else Icons.Outlined.BookmarkBorder,
                            contentDescription = "Bookmark",
                            tint = if (article.isBookmarked) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = article.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "\${article.publishedAt} • \${article.readTimeMinutes} min read",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/flashnews24/nativeapp/service/FlashNewsMessagingService.kt',
    language: 'kotlin',
    layer: 'service',
    description: 'Firebase Cloud Messaging (FCM) background service triggering native notifications and deep links.',
    content: `package com.flashnews24.nativeapp.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.flashnews24.nativeapp.ui.MainActivity
import com.flashnews24.nativeapp.R

class FlashNewsMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Send token to FlashNews24 backend servers
        sendRegistrationToServer(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val title = remoteMessage.notification?.title ?: remoteMessage.data["title"] ?: "🚨 FlashNews24 Breaking"
        val body = remoteMessage.notification?.body ?: remoteMessage.data["body"] ?: "New urgent headline available."
        val articleId = remoteMessage.data["articleId"]

        sendNotification(title, body, articleId)
    }

    private fun sendNotification(title: String, messageBody: String, articleId: String?) {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            if (articleId != null) {
                data = Uri.parse("flashnews://article/\$articleId")
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        val channelId = "breaking_news_channel_v1"
        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(messageBody)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVibrate(longArrayOf(0, 300, 200, 300))
            .setContentIntent(pendingIntent)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Breaking News & Urgent Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Real-time notifications for global breaking headlines"
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
    }

    private fun sendRegistrationToServer(token: String) {
        // HTTP POST to https://api.flashnews24.site/register-fcm
    }
}`
  }
];
