/**
 * global app, jasmine, describe, it, beforeEach, expect 
*/

describe("controller", function () {
	"use strict";

	let subject, model, view;

	let setUpModel = function (todos) {
		model.read.and.callFake(function (query, callback) {
			callback = callback || query;
			callback(todos);
		});

		model.getCount.and.callFake(function (callback) {

			let todoCounts = {
				active: todos.filter(function (todo) {
					return !todo.completed;
				}).length,
				completed: todos.filter(function (todo) {
					return !!todo.completed;
				}).length,
				total: todos.length
			};

			callback(todoCounts);
		});

		model.remove.and.callFake(function (id, callback) {
			callback();
		});

		model.create.and.callFake(function (title, callback) {
			callback();
		});

		model.update.and.callFake(function (id, updateData, callback) {
			callback();
		});
	};

	let createViewStub = function () {
		let eventRegistry = {};
		return {
			render: jasmine.createSpy("render"),
			bind: function (event, handler) {
				eventRegistry[event] = handler;
			},
			trigger: function (event, parameter) {
				eventRegistry[event](parameter);
			}
		};
	};

	beforeEach(function () {
		model = jasmine.createSpyObj("model", ["read", "getCount", "remove", "create", "update"]);
		view = createViewStub();
		subject = new app.Controller(model, view);
	});

	it("should show entries on start-up", function () {
		// TODO: write test
		// Define a fake "todo" as the model
		let todo = {};
		setUpModel([todo]);
		// If the controller must to set the view without options (completed, active)
		subject.setView("#/");
		// Expected: the view calls "render" with the "showEntries" parameters to displaying todos
		expect(view.render).toHaveBeenCalledWith("showEntries", [todo]);
	});

	describe("routing", function () {

		it("should show all entries without a route", function () {
			let todo = {title: "my todo"};
			setUpModel([todo]);

			subject.setView("");

			expect(view.render).toHaveBeenCalledWith("showEntries", [todo]);
		});

		it("should show all entries without \"all\" route", function () {
			let todo = {title: "my todo"};
			setUpModel([todo]);

			subject.setView("#/");

			expect(view.render).toHaveBeenCalledWith("showEntries", [todo]);
		});

		it("should show active entries", function () {
			// TODO: write test
			let todo = {title: "my todo"};
			setUpModel([todo]);
			// If the controller must to set the view with option active
			subject.setView("#/active");
			// Expected: the view calls "render" with the "showEntries" parameters to displaying todos
			expect(view.render).toHaveBeenCalledWith("showEntries", [todo]);
		});

		it("should show completed entries", function () {
			// TODO: write test
			let todo = {title: "my todo"};
			setUpModel([todo]);
			// If the controller must to set the view with option completed
			subject.setView("#/completed");
			// Expected: the view calls "render" with the "showEntries" parameters to displaying todos
			expect(view.render).toHaveBeenCalledWith("showEntries", [todo]);
		});
	});

	it("should show the content block when todos exists", function () {
		setUpModel([{title: "my todo", completed: true}]);

		subject.setView("");

		expect(view.render).toHaveBeenCalledWith("contentBlockVisibility", {
			visible: true
		});
	});

	it("should hide the content block when no todos exists", function () {
		setUpModel([]);

		subject.setView("");

		expect(view.render).toHaveBeenCalledWith("contentBlockVisibility", {
			visible: false
		});
	});

	it("should check the toggle all button, if all todos are completed", function () {
		setUpModel([{title: "my todo", completed: true}]);

		subject.setView("");

		expect(view.render).toHaveBeenCalledWith("toggleAll", {
			checked: true
		});
	});

	it("should set the \"clear completed\" button", function () {
		let todo = {id: 42, title: "my todo", completed: true};
		setUpModel([todo]);

		subject.setView("");

		expect(view.render).toHaveBeenCalledWith("clearCompletedButton", {
			completed: 1,
			visible: true
		});
	});

	it("should highlight \"All\" filter by default", function () {
		// TODO: write test
		// If setView has no parameters
		subject.setView("");
		// Expected: the view calls setFilter without parameters, with the empty string 
		// because currentPage === "" to target the All button (with qs) 
		expect(view.render).toHaveBeenCalledWith("setFilter", "");
	});

	it("should highlight \"Active\" filter when switching to active view", function () {
		// TODO: write test
		let todo = {title: "my todo"};
		setUpModel([todo]);
		// If the controller must to set the view with option active
		subject.setView("#/active");

		// Expected: the view calls setFilter with the active parameters 
		// to target the Active button (with qs) 
		expect(view.render).toHaveBeenCalledWith("setFilter", "active");
	});

	describe("toggle all", function () {
		it("should toggle all todos to completed", function () {
			// TODO: write test
			// Test if it toggles ALL checkboxes on/off state and completeness of models
			// Create at least 2 tasks in the array of todos to test them
			let todos = [{id: 42, title: "my todo 1", completed: true}, {id: 43, title: "my todo 2", completed: false}];
			setUpModel(todos);

			// Set the view on main page
			subject.setView("");

			// Click on toggle-all checkbox to trigger the toggle event where the parameter completed is true
			view.trigger("toggleAll", {completed: true});

			// Test Model.prototype.update = function (id, data, callback)
			// Expected: the update of todos when their "completed" attributes to be changed to "true"
			expect(model.update).toHaveBeenCalledWith(42, {completed: true}, jasmine.any(Function));
			expect(model.update).toHaveBeenCalledWith(43, {completed: true}, jasmine.any(Function));
		});

		it("should update the view", function () {
			// TODO: write test
			// Create at least 2 tasks in the array of todos to test them. They are not complete yet.
			let todos = [{id: 42, title: "my todo 1", completed: false}, {id: 43, title: "my todo 2", completed: false}];
			setUpModel(todos);

			// Set the view on main page
			subject.setView("");

			// Click on toggle-all checkbox to trigger the toggle event where the parameter completed is true
			view.trigger("toggleAll", {completed: true});
			
			/**
			 * It should test: Controller.prototype.toggleComplete = function (id, completed, silent) {...}
			 * self.model.update(id, { completed: completed }, function () {
			 *	 self.view.render("elementComplete", {
					id: id,
					completed: completed
				});
			});
			 **/
			expect(view.render).toHaveBeenCalledWith("elementComplete", {id: 42, completed: true});
			expect(view.render).toHaveBeenCalledWith("elementComplete", {id: 43, completed: true});
		});
	});

	describe("new todo", function () {
		it("should add a new todo to the model", function () {
			// TODO: write test
			// Set the view on main page
			subject.setView("");

			// If a new todo is created in the input id="new-todo"
			view.trigger("newTodo", "a new todo");
			
			/**
			 * It should test: Controller.prototype.addItem = function (title) {...}
			 * self.model.create(title, function () {
					self.view.render("clearNewTodo");
					self._filter(true);
				});
			 */
			
			// Expected: the model to creat a new todo. The input value is "title"
			expect(model.create).toHaveBeenCalledWith("a new todo", jasmine.any(Function));
		});

		it("should add a new todo to the view", function () {
			setUpModel([]);

			subject.setView("");

			view.render.calls.reset();
			model.read.calls.reset();
			model.read.and.callFake(function (callback) {
				callback([{
					title: "a new todo",
					completed: false
				}]);
			});

			// If a new todo is created in the input id="new-todo"
			view.trigger("newTodo", "a new todo");

			expect(model.read).toHaveBeenCalled();

			expect(view.render).toHaveBeenCalledWith("showEntries", [{
				title: "a new todo",
				completed: false
			}]);
		});

		it("should clear the input field when a new todo is added", function () {
			setUpModel([]);

			subject.setView("");

			view.trigger("newTodo", "a new todo");

			expect(view.render).toHaveBeenCalledWith("clearNewTodo");
		});
	});

	describe("element removal", function () {
		it("should remove an entry from the model", function () {
			// TODO: write test
			// Set todo to remove
			let todo = {id: 42, title: "my todo", completed: true};
			setUpModel([todo]);

			subject.setView("");

			view.trigger("itemRemove", {id: 42});
			
			/**
			 * It should test: Controller.prototype.removeItem = function (id) {...}
			 * It finds the DOM element matching that ID, removes it from the DOM and also remove it from storage.
			 * Expected: the model removes a todo.
			 */
			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});

		it("should remove an entry from the view", function () {
			let todo = {id: 42, title: "my todo", completed: true};
			setUpModel([todo]);

			subject.setView("");
			view.trigger("itemRemove", {id: 42});

			expect(view.render).toHaveBeenCalledWith("removeItem", 42);
		});

		it("should update the element count", function () {
			let todo = {id: 42, title: "my todo", completed: true};
			setUpModel([todo]);

			subject.setView("");
			view.trigger("itemRemove", {id: 42});

			expect(view.render).toHaveBeenCalledWith("updateElementCount", 0);
		});
	});

	describe("remove completed", function () {
		it("should remove a completed entry from the model", function () {
			let todo = {id: 42, title: "my todo", completed: true};
			setUpModel([todo]);

			subject.setView("");
			view.trigger("removeCompleted");

			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));
			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});

		it("should remove a completed entry from the view", function () {
			let todo = {id: 42, title: "my todo", completed: true};
			setUpModel([todo]);

			subject.setView("");
			view.trigger("removeCompleted");

			expect(view.render).toHaveBeenCalledWith("removeItem", 42);
		});
	});

	describe("element complete toggle", function () {
		it("should update the model", function () {
			let todo = {id: 21, title: "my todo", completed: false};
			setUpModel([todo]);
			subject.setView("");

			view.trigger("itemToggle", {id: 21, completed: true});

			expect(model.update).toHaveBeenCalledWith(21, {completed: true}, jasmine.any(Function));
		});

		it("should update the view", function () {
			let todo = {id: 42, title: "my todo", completed: true};
			setUpModel([todo]);
			subject.setView("");

			view.trigger("itemToggle", {id: 42, completed: false});

			expect(view.render).toHaveBeenCalledWith("elementComplete", {id: 42, completed: false});
		});
	});

	describe("edit item", function () {
		it("should switch to edit mode", function () {
			let todo = {id: 21, title: "my todo", completed: false};
			setUpModel([todo]);

			subject.setView("");

			view.trigger("itemEdit", {id: 21});

			expect(view.render).toHaveBeenCalledWith("editItem", {id: 21, title: "my todo"});
		});

		it("should leave edit mode on done", function () {
			let todo = {id: 21, title: "my todo", completed: false};
			setUpModel([todo]);

			subject.setView("");

			view.trigger("itemEditDone", {id: 21, title: "new title"});

			expect(view.render).toHaveBeenCalledWith("editItemDone", {id: 21, title: "new title"});
		});

		it("should persist the changes on done", function () {
			let todo = {id: 21, title: "my todo", completed: false};
			setUpModel([todo]);

			subject.setView("");

			view.trigger("itemEditDone", {id: 21, title: "new title"});

			expect(model.update).toHaveBeenCalledWith(21, {title: "new title"}, jasmine.any(Function));
		});

		it("should remove the element from the model when persisting an empty title", function () {
			let todo = {id: 21, title: "my todo", completed: false};
			setUpModel([todo]);

			subject.setView("");

			view.trigger("itemEditDone", {id: 21, title: ""});

			expect(model.remove).toHaveBeenCalledWith(21, jasmine.any(Function));
		});

		it("should remove the element from the view when persisting an empty title", function () {
			let todo = {id: 21, title: "my todo", completed: false};
			setUpModel([todo]);

			subject.setView("");

			view.trigger("itemEditDone", {id: 21, title: ""});

			expect(view.render).toHaveBeenCalledWith("removeItem", 21);
		});

		it("should leave edit mode on cancel", function () {
			let todo = {id: 21, title: "my todo", completed: false};
			setUpModel([todo]);

			subject.setView("");

			view.trigger("itemEditCancel", {id: 21});

			expect(view.render).toHaveBeenCalledWith("editItemDone", {id: 21, title: "my todo"});
		});

		it("should not persist the changes on cancel", function () {
			let todo = {id: 21, title: "my todo", completed: false};
			setUpModel([todo]);

			subject.setView("");

			view.trigger("itemEditCancel", {id: 21});

			expect(model.update).not.toHaveBeenCalled();
		});
	});
});
