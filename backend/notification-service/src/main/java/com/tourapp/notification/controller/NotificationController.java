package com.tourapp.notification.controller;

import com.tourapp.common.dto.ApiResponse;
import com.tourapp.notification.entity.Notification;
import com.tourapp.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Notification>> sendNotification(@RequestBody Notification notification) {
        Notification sent = notificationService.sendNotification(notification);
        return ResponseEntity.ok(ApiResponse.success(sent, "Notification dispatched."));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getNotificationsForUser(userId);
        return ResponseEntity.ok(ApiResponse.success(notifications, "Notifications list retrieved."));
    }
}
