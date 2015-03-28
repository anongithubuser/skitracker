var app = app || {};

(function($) {

	app.RATES = {
		membership: 20.0,
		greenBoatRun: 4.0,
		whiteBoatRun: 6.0,
		advEquipment: 2.0,
		entry: 5.0,
		guestDiscount: -2.0
	};

	var AppState = Backbone.Model.extend({
		/*
		 * pages = [home, skiers, skier]
		 */
		defaults: {
			currentPage: 'home',
			selectedSkier: null,
			selectedSkiDay: null
		}
	});

	var AppView = Backbone.View.extend({
		el: $('body'),

		initialize: function() {
			this.listenTo(app.appState, 'change:currentPage', this.route);
		},

		route: function() {
			var $page = $('#' + app.appState.get('currentPage'));
			$('.in').removeClass('in');
			$page.addClass('in');
		}
	});

	var HomeView = Backbone.View.extend({
		/* Bind to the body element */
		el: $('#home'),

		/* Register all event listeners for the page */
		events: {
			'click .add-new-ski-day': 'createNew'
		},

		initialize: function() {
			this.listenTo(app.skiDays, 'reset', this.addAll);
			this.listenTo(app.skiDays, 'add', this.addOne);
			this.listenTo(app.skiDays, 'change:participantsCount', this.addAll);
			this.$list = $('#ski-day-list');
			app.skiDays.fetch({reset: true});
		},

		createNew: function() {
			var name = prompt("Please enter a title", "Ski Day");

			if (!name) return;

			var newSkiDay = {
				id: (new Date()).getTime(),
				title: name
			};
			app.skiDays.create(newSkiDay);
		},

		/* Adds a new ski day to the page */
		addOne: function(skiDay) {
			console.log("Adding one ski day.");

			var view = new app.SkiDayItemView({ model: skiDay });
			this.$list.append(view.render().el);
		},

		/* Add all the ski days to the page */
		addAll: function() {
			console.log("Adding all ski days.");
			this.$list.html('');

			// loop over the ski days and add them
			app.skiDays.each(this.addOne, this);
		}
	});

	var SkierListView = Backbone.View.extend({

		el: $('#skiers'),

		events: {
			'click .add-new': 'createNew',
			'click .back': 'back',
			'click .js-green-boat-picker': 'selectGreenBoat',
			'click .js-white-boat-picker': 'selectWhiteBoat'
		},

		initialize: function() {
			this.listenTo(app.appState, 'change:selectedSkiDay', this.addAll);
			this.$list = $("#skier-list");
			this.$greenBoatBtn = $('.js-green-boat-picker');
			this.$whiteBoatBtn = $('.js-white-boat-picker');

			app.participants.fetch({reset: true});
		},

		addOne: function(skier) {
			console.log("Adding individual skier.");
			var view = new app.SkierItemView({ model: skier });
			this.$list.append(view.render().el);
		},

		addAll: function() {
			console.log("Adding all skiers to ski day.");
			this.$list.html('');

			var skiDayId = app.appState.get('selectedSkiDay').get('id');
			var participants = app.participants.getParticipantsForSkiDay(skiDayId);

			var self = this;
			_.each(participants, function(participant) {
				self.addOne(participant);
			});

			// init boat selection too
			this.$whiteBoatBtn.removeClass('active');
			this.$greenBoatBtn.removeClass('active');
			if (app.appState.get('selectedSkiDay').get('boatType') == 'green') {
				this.$greenBoatBtn.addClass('active');
			} else {
				this.$whiteBoatBtn.addClass('active');
			}
		},

		createNew: function() {
			var name = prompt("Please enter the skier's name", "");

			if (!name) return;

			var selectedSkiDay = app.appState.get('selectedSkiDay');
			var newSkier = {
				id: (new Date()).getTime(),
				skiDayId: selectedSkiDay.get('id'),
				name: name
			};
			app.participants.create(newSkier);
			selectedSkiDay.addParticipant();
			this.addAll();
		},

		back: function() {
			app.appState.set({
				currentPage: 'home'
			});
		},

		selectGreenBoat: function() {
			var selectedSkiDay = app.appState.get('selectedSkiDay');

			this.$greenBoatBtn.addClass('active');
			this.$whiteBoatBtn.removeClass('active');

			selectedSkiDay.save({
				boatType: 'green'
			});

			this.addAll();
		},
		selectWhiteBoat: function() {
			var selectedSkiDay = app.appState.get('selectedSkiDay');

			this.$whiteBoatBtn.addClass('active');
			this.$greenBoatBtn.removeClass('active');

			selectedSkiDay.save({
				boatType: 'white'
			});

			this.addAll();
		}
	});

	var SkierDetailView = Backbone.View.extend({

		el: $("#skier"),

		events: {
			'click .back': 'back',
			'click .js-is-member-picker': 'selectIsMember',
			'click .js-is-non-member-picker': 'selectIsNonMember',
			'change .js-num-skis': 'save',
			'change .js-num-equip': 'save',
			'change .js-num-guests': 'save',
			'change .js-discount': 'save'
		},

		initialize: function() {
			this.listenTo(app.appState, 'change:selectedSkier', this.refresh);
			this.$numSkis = $('.js-num-skis');
			this.$numEquip = $('.js-num-equip');
			this.$numGuests = $('.js-num-guests');
			this.$discount = $('.js-discount');
			this.$isMember = $('.js-is-member-picker');
			this.$isNonMember = $('.js-is-non-member-picker');
			this.$name = $('.js-name');
			console.log("Opened skier page!");
		},

		refresh: function() {
			this.model = app.appState.get('selectedSkier');

			this.$numSkis.val(this.model.get('numSkis'));
			this.$numEquip.val(this.model.get('numEquipmentHires'));
			this.$numGuests.val(this.model.get('numGuestsBrought'));
			this.$discount.val(this.model.get('totalDiscount'));
			this.$name.html(this.model.get('name'));

			var isMember = this.model.get('isClubMember');

			// init the member picker
			this.$isNonMember.removeClass('active');
			this.$isMember.removeClass('active');

			if (isMember) {
				this.$isMember.addClass('active');
			} else {
				this.$isNonMember.addClass('active');
			}
		},

		save: function() {
			console.log("Data changed, saving.");

			this.model.save({
				numSkis: this.$numSkis.val(),
				numEquipmentHires: this.$numEquip.val(),
				numGuestsBrought: this.$numGuests.val(),
				totalDiscount: this.$discount.val()
			});
		},

		selectIsMember: function() {
			console.log("Select is member.");
			this.$isNonMember.removeClass('active');
			this.$isMember.addClass('active');
			this.model.save({ isClubMember: true });
		},

		selectIsNonMember: function() {
			console.log("Select is non member.");
			this.$isMember.removeClass('active');
			this.$isNonMember.addClass('active');
			this.model.save({ isClubMember: false });
		},

		back: function() {
			console.log("Back");

			app.appState.set({
				currentPage: 'skiers'
			});
		}
	});

	$(function() {
		app.appState = new AppState();
		app.homeView = new HomeView();
		app.appView = new AppView();
		app.skierListView = new SkierListView();
		app.skierDetailView = new SkierDetailView();
	});

})($);
