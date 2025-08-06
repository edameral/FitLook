package com.project.fitlook.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.fitlook.entities.User;
import com.project.fitlook.exceptions.UserNotFoundException;
import com.project.fitlook.responses.UserResponse;
import com.project.fitlook.services.UserService;


@RestController
@RequestMapping("/users")
public class UserController {
	
	private UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}
	
	@GetMapping
	public List<User> getAllUsers(){
		return userService.getAllUsers();
	}
	
	@DeleteMapping("/{userId}")
	public void deleteOneUser(@PathVariable long userId ) {
		userService.deleteById(userId);
	}
	
	@PostMapping
	public User createUser(@RequestBody User newUser) {
		return userService.saveOneUser(newUser);
	}
	
	@GetMapping("/{userId}")
	public UserResponse getOneUser(@PathVariable Long userId) { 
		User user = userService.getOneUserById(userId);
		if(user == null) {
			throw new UserNotFoundException();
		}
		return new UserResponse(user);
	}
	
	@GetMapping("/firebase/{firebaseId}")
	public Long getOneUserByFireBaseId(@PathVariable String firebaseId) { 
	    User user = userService.getOneUserByFireBaseId(firebaseId);
	    if (user == null) {
	        throw new UserNotFoundException();
	    }
	    return user.getId();
	}
	
	
}
