package com.project.fitlook.repos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.fitlook.entities.User;


public interface UserRepository extends JpaRepository<User,Long>{
	Optional<User> findByFirebaseUid(String firebaseUid);
}
