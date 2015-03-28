var app = app || {};

(function() {

	app.SkierItemView = Backbone.View.extend({

		tagName: 'li',
		template: _.template($('#skierTemplate').html()),
		events: {
			'click': 'openSkier'
		},

		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
		},

		render: function() {
			if (this.model.changed.id !== undefined) {
				return;
			}

			// recalculate the costs.
			var skiDay = app.skiDays.getById(this.model.get('skiDayId'))[0];
			var pricePerSki;

			if (this.model.get('isClubMember')) {
				pricePerSki = skiDay.get('boatType') === 'green' ? app.RATES.greenBoatRun : app.RATES.whiteBoatRun;
			} else {
				pricePerSki = 20.0;
			}

			this.model.set({
				totalPayable:
					app.RATES.entry + // entry
					pricePerSki * this.model.get('numSkis') + // skis
					(app.RATES.advEquipment * this.model.get('numEquipmentHires')) + // equipment
					(app.RATES.guestDiscount * this.model.get('numGuestsBrought')) -
					this.model.get('totalDiscount') // discount
			});

			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		openSkier: function() {
			console.log("Trying to open skier.");
			app.appState.set({
				currentPage: 'skier',
				selectedSkier: this.model
			});
		}
	});

})();