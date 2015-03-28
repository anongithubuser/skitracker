var app = app || {};

(function() {

	app.SkiDayItemView = Backbone.View.extend({

		tagName: 'li',

		template: _.template($('#skiDayTemplate').html()),

		events: {
			'click': 'openSkiDay'
		},

		render: function() {
			if (this.model.changed.id !== undefined) {
				return;
			}

			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		openSkiDay: function() {
			app.appState.set({
				'currentPage': 'skiers',
				'selectedSkiDay': this.model
			});
		}
	});

})();