var app = app || {};

(function(app) {

	app.SkiDay = Backbone.Model.extend({

		defaults: {
			id: null,
			name: '',
			participantsCount: 0,
			boatType: 'green' // or white
		},

		addParticipant: function() {
			console.log("Incrementing participant count on selected ski day.");
			this.save({
				participantsCount: this.get('participantsCount') + 1
			});
		}
	});

})(app);