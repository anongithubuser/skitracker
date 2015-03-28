var app = app || {};

(function() {

	var Participants = Backbone.Collection.extend({

		model: app.Participant,
		localStorage: new Backbone.LocalStorage('participants'),

		getParticipantsForSkiDay: function(skiDayId) {
			return this.where({ skiDayId: skiDayId });
		}

	});

	app.participants = new Participants();

})();