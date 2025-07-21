package com.ffb.be.service;

import com.ffb.be.model.entity.Project;
import com.ffb.be.model.entity.Sprint;
import com.ffb.be.repository.jpa.SprintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MailService {

    private final SprintRepository sprintRepository;
    private final JavaMailSender javaMailSender;

    @Scheduled(cron = "0 0 9 * * *") // every day at 9 AM
    public void notifySprintsEndingSoon() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrowStart = now.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime tomorrowEnd = tomorrowStart.withHour(23).withMinute(59).withSecond(59);

        List<Sprint> sprints = sprintRepository.findActiveSprintsEndingBetween(tomorrowStart, tomorrowEnd);

        for (Sprint sprint : sprints) {

            String subject = "Sprint Ending Soon";
            String body = String.format("Sprint #%d is ending tomorrow (%s).", sprint.getId(), sprint.getEndDate());

            Project project = sprint.getProject();

            if (project.getTeamLead() != null && !project.getTeamLead().getEmail().isBlank()) {
                sendMail(project.getTeamLead().getEmail(), subject, body);
            }

            if (project.getManager() != null && !project.getManager().getEmail().isBlank()) {
                sendMail(project.getManager().getEmail(), subject, body);
            }
        }
    }

    public void sendMail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        javaMailSender.send(message);
    }
}

