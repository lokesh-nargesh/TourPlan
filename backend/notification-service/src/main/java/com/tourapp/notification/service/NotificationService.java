package com.tourapp.notification.service;

import com.tourapp.notification.entity.Notification;
import com.tourapp.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification sendNotification(Notification notification) {
        notification.setStatus("SENT");
        
        // Simulating notification dispatch (Console logging)
        System.out.println("----------------------------------------");
        System.out.println("DISPATCHING " + notification.getType() + " NOTIFICATION");
        System.out.println("To User ID: " + notification.getUserId());
        System.out.println("Title: " + notification.getTitle());
        System.out.println("Message: " + notification.getMessage());
        System.out.println("----------------------------------------");

        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
