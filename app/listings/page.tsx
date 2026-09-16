<div className="px-4 pb-4">
                    <a
                      href={`/listings/${property.id}`}
                      className="w-full text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                    >
                      {t('listings.viewDetails')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    );
  }
}